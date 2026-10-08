"use client";

import { useEffect, useRef, useState } from "react";
import {
  BANNER_ALLOWED_MIME_TYPES,
  BANNER_IMAGE_HEIGHT,
  BANNER_IMAGE_WIDTH,
  BANNER_MAX_IMAGE_BYTES,
  BANNER_MAX_IMAGES_PER_GROUP,
  BANNER_PLACEMENTS,
} from "@mcj/shared-constants";
import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  ImageOff,
  Link2,
  RefreshCw,
  Star,
  Trash2,
  Upload,
} from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Modal } from "@/src/shared/components/ui/model";
import { appToast } from "@/src/shared/components/ui/toast";
import {
  ValidatedField,
  validatedFieldInputClass,
  type FieldVisualState,
} from "@/src/shared/components/ui/validated-field";
import { cn } from "@/src/shared/lib/cn";

import { bannerService } from "@/src/features/banners/services/banner.service";
import type {
  BannerDetail,
  BannerPlacement,
  BannerStatus,
} from "@/src/features/banners/types/banner.types";

function isValidBannerLink(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return true;
  }

  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

interface DraftImage {
  key: string;
  imageId?: string;
  uploadId?: string;
  previewUrl: string;
  file?: File;
  isPrimary: boolean;
  link: string;
}

interface Props {
  open: boolean;
  bannerId?: string | null;
  onClose: () => void;
  onSaved: () => void;
}

export function BannerFormModal({
  open,
  bannerId,
  onClose,
  onSaved,
}: Props) {
  const isEdit = Boolean(bannerId);
  const [name, setName] = useState("");
  const [type, setType] = useState<BannerPlacement>("HOMEPAGE");
  const [status, setStatus] = useState<BannerStatus>("ACTIVE");
  const [images, setImages] = useState<DraftImage[]>([]);
  const [nameTouched, setNameTouched] = useState(false);
  const [typeTouched, setTypeTouched] = useState(false);
  const [statusTouched, setStatusTouched] = useState(false);
  const [imagesTouched, setImagesTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [touchedLinks, setTouchedLinks] = useState<Record<string, boolean>>({});
  const [nameError, setNameError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [dropKey, setDropKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const [uploadLabel, setUploadLabel] = useState<string | null>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const replaceKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setNameError(null);
    setImageError(null);
    setUploadLabel(null);
    setNameTouched(false);
    setTypeTouched(false);
    setStatusTouched(false);
    setImagesTouched(false);
    setSubmitted(false);
    setTouchedLinks({});
    setDragKey(null);
    setDropKey(null);

    if (!bannerId) {
      setName("");
      setType("HOMEPAGE");
      setStatus("ACTIVE");
      setImages([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void bannerService
      .getById(bannerId)
      .then((banner: BannerDetail) => {
        if (cancelled) {
          return;
        }

        setName(banner.name);
        setType(banner.type);
        setStatus(banner.status);
        setImages(
          [...banner.images]
            .sort((left, right) => left.displayOrder - right.displayOrder)
            .map((image) => ({
              key: image.id,
              imageId: image.id,
              uploadId: image.uploadId,
              previewUrl: image.imageUrl,
              isPrimary: image.isPrimary,
              link: image.link ?? "",
            })),
        );
      })
      .catch((error) => {
        if (!cancelled) {
          appToast.error(bannerService.getError(error));
          onClose();
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [bannerId, onClose, open]);

  const setPrimary = (key: string) => {
    setImages((current) =>
      current.map((image) => ({
        ...image,
        isPrimary: image.key === key,
      })),
    );
  };

  const updateLink = (key: string, link: string) => {
    setImages((current) =>
      current.map((image) =>
        image.key === key ? { ...image, link } : image,
      ),
    );
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    setImages((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) {
        return current;
      }

      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(nextIndex, 0, item!);
      return next;
    });
  };

  const addFiles = async (fileList: FileList | null) => {
    if (!fileList?.length) {
      return;
    }

    const incoming = Array.from(fileList);
    if (images.length + incoming.length > BANNER_MAX_IMAGES_PER_GROUP) {
      setImageError(
        `A banner can contain at most ${BANNER_MAX_IMAGES_PER_GROUP} images.`,
      );
      return;
    }

    const accepted: DraftImage[] = [];

    try {
      for (const file of incoming) {
        if (
          !(BANNER_ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)
        ) {
          setImageError("Only PNG, JPG, JPEG, and WEBP images are allowed.");
          return;
        }

        if (file.size > BANNER_MAX_IMAGE_BYTES) {
          setImageError("Each image must be 5 MB or smaller.");
          return;
        }

        setUploadLabel(
          `Processing image ${accepted.length + 1} of ${incoming.length}`,
        );
        const uploaded = await bannerService.uploadImage(file);

        accepted.push({
          key: uploaded.uploadId,
          uploadId: uploaded.uploadId,
          previewUrl: uploaded.imageUrl,
          isPrimary: false,
          link: "",
        });
      }

      setImageError(null);
      setImages((current) => {
        const next = [...current, ...accepted];
        if (!next.some((image) => image.isPrimary) && next[0]) {
          next[0] = { ...next[0], isPrimary: true };
        }
        return next;
      });
    } catch (error) {
      setImageError(bannerService.getError(error));
    } finally {
      setUploadLabel(null);
    }
  };

  const replaceFile = async (key: string, file: File | undefined) => {
    if (!file) {
      return;
    }

    if (!(BANNER_ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)) {
      setImageError("Only PNG, JPG, JPEG, and WEBP images are allowed.");
      return;
    }

    if (file.size > BANNER_MAX_IMAGE_BYTES) {
      setImageError("Each image must be 5 MB or smaller.");
      return;
    }

    const currentIndex = images.findIndex((image) => image.key === key);
    const current = images[currentIndex];
    if (!current) {
      return;
    }

    setImageError(null);
    setReplacing(true);
    setUploadLabel(`Replacing image ${currentIndex + 1}`);

    try {
      const uploaded = await bannerService.uploadImage(file);
      const nextPreview = {
        uploadId: uploaded.uploadId,
        previewUrl: uploaded.imageUrl,
      };

      const previousUploadId = current.uploadId;
      const persistedImageId = current.imageId;

      if (bannerId && persistedImageId) {
        try {
          const replaced = await bannerService.replaceImage(
            bannerId,
            persistedImageId,
            uploaded.uploadId,
          );
          nextPreview.uploadId = replaced.uploadId;
          nextPreview.previewUrl = replaced.imageUrl;
          onSaved();
        } catch (error) {
          await bannerService.deleteUpload(uploaded.uploadId).catch(() => undefined);
          throw error;
        }
      }

      setImages((list) =>
        list.map((item) =>
          item.key === key
            ? {
                ...item,
                uploadId: nextPreview.uploadId,
                previewUrl: nextPreview.previewUrl,
                isPrimary: item.isPrimary,
                link: item.link,
              }
            : item,
        ),
      );

      if (
        !persistedImageId &&
        previousUploadId &&
        previousUploadId !== nextPreview.uploadId
      ) {
        await bannerService.deleteUpload(previousUploadId).catch(() => undefined);
      }
    } catch (error) {
      setImageError(bannerService.getError(error));
    } finally {
      setReplacing(false);
      setUploadLabel(null);
    }
  };

  const nameMessage =
    name.trim().length < 2
      ? "Banner name is required."
      : name.trim().length > 120
        ? "Banner name must be 120 characters or fewer."
        : null;
  const showName = nameTouched || submitted;
  const showImages = imagesTouched || submitted;
  const nameState: FieldVisualState = !showName
    ? "neutral"
    : nameMessage
      ? "invalid"
      : "valid";
  const typeState: FieldVisualState =
    typeTouched || submitted ? "valid" : "neutral";
  const statusState: FieldVisualState =
    statusTouched || submitted ? "valid" : "neutral";

  const reorderImages = (fromKey: string, toKey: string) => {
    if (fromKey === toKey) {
      return;
    }

    setImages((current) => {
      const fromIndex = current.findIndex((image) => image.key === fromKey);
      const toIndex = current.findIndex((image) => image.key === toKey);
      if (fromIndex < 0 || toIndex < 0) {
        return current;
      }

      const next = [...current];
      const [item] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, item!);
      return next;
    });
  };

  const save = async () => {
    setSubmitted(true);
    const trimmed = name.trim();
    const nextNameError =
      trimmed.length < 2
        ? "Banner name is required."
        : trimmed.length > 120
          ? "Banner name must be 120 characters or fewer."
          : null;

    if (nextNameError) {
      setNameError(nextNameError);
    }

    if (!images.length) {
      setImageError("Add at least one banner image.");
      return;
    }

    if (images.some((image) => !isValidBannerLink(image.link))) {
      setImageError("Enter a valid link for each image, including https://.");
      setTouchedLinks(
        Object.fromEntries(images.map((image) => [image.key, true])),
      );
      return;
    }

    if (nextNameError) {
      return;
    }

    setNameError(null);
    setImageError(null);
    setSaving(true);

    try {
      const uploaded = [];

      for (const [index, image] of images.entries()) {
        if (image.uploadId) {
          uploaded.push({
            id: image.imageId,
            uploadId: image.uploadId,
            isPrimary: image.isPrimary,
            displayOrder: index + 1,
            link: image.link.trim() || null,
          });
          continue;
        }

        if (!image.file) {
          throw new Error("A selected image is missing its file.");
        }

        setUploadLabel(`Uploading image ${index + 1} of ${images.length}`);
        const result = await bannerService.uploadImage(image.file);
        uploaded.push({
          uploadId: result.uploadId,
          isPrimary: image.isPrimary,
          displayOrder: index + 1,
          link: image.link.trim() || null,
        });
      }

      if (!uploaded.some((image) => image.isPrimary) && uploaded[0]) {
        uploaded[0].isPrimary = true;
      }

      const payload = {
        name: trimmed,
        type,
        status,
        images: uploaded,
      };

      const response = bannerId
        ? await bannerService.update(bannerId, payload)
        : await bannerService.create(payload);

      appToast.success(response.message);
      onSaved();
      onClose();
    } catch (error) {
      const message = bannerService.getError(error);
      if (message.toLowerCase().includes("name")) {
        setNameError(message);
      } else {
        setImageError(message);
      }
    } finally {
      setSaving(false);
      setUploadLabel(null);
    }
  };

  return (
    <Modal
      open={open}
      title={isEdit ? "Edit Banner" : "Add Banner"}
      onClose={onClose}
      bodyClassName="max-h-[80vh] overflow-y-auto bg-white px-6 py-5"
    >
      {loading ? (
        <p className="text-sm text-slate-500">Loading banner...</p>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <ValidatedField
              label="Banner Name"
              required
              state={nameError && showName ? "invalid" : nameState}
              errorMessage={showName ? nameError ?? nameMessage : null}
              successMessage={nameState === "valid" && !nameError ? "Looks good" : null}
            >
              <Input
                value={name}
                placeholder="Homepage Main Banner"
                disabled={saving || replacing}
                className={validatedFieldInputClass(
                  nameError && showName ? "invalid" : nameState,
                )}
                onBlur={() => setNameTouched(true)}
                onChange={(event) => {
                  setName(event.target.value);
                  setNameError(null);
                }}
              />
            </ValidatedField>

            <ValidatedField
              label="Banner Type"
              required
              select
              state={typeState}
              successMessage={typeState === "valid" ? "Selected" : null}
            >
              <AppSelect
                value={type}
                options={BANNER_PLACEMENTS.map((item) => ({
                  value: item.value,
                  label: item.label,
                }))}
                disabled={saving || replacing}
                triggerClassName={validatedFieldInputClass(typeState, undefined, {
                  select: true,
                })}
                onValueChange={(value) => {
                  setTypeTouched(true);
                  setType(value as BannerPlacement);
                }}
              />
            </ValidatedField>

            <ValidatedField
              label="Status"
              required
              select
              state={statusState}
              successMessage={statusState === "valid" ? "Selected" : null}
            >
              <AppSelect
                value={status}
                options={[
                  { value: "ACTIVE", label: "Active" },
                  { value: "INACTIVE", label: "Inactive" },
                ]}
                disabled={saving || replacing}
                triggerClassName={validatedFieldInputClass(statusState, undefined, {
                  select: true,
                })}
                onValueChange={(value) => {
                  setStatusTouched(true);
                  setStatus(value as BannerStatus);
                }}
              />
            </ValidatedField>
          </div>

          <section className="rounded-xl border border-[#E1EBF5] bg-[#F8FBFF] p-3">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <Label required>Banner Images</Label>
                <p className="text-xs leading-5 text-[#647A9B]">
                  Required resolution {BANNER_IMAGE_WIDTH} × {BANNER_IMAGE_HEIGHT} px.
                  PNG, JPG, JPEG, or WEBP. Up to {BANNER_MAX_IMAGES_PER_GROUP} images.
                  Images are resized to fit the banner.
                </p>
              </div>
              <label className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-[#2563EB] px-3 text-xs font-semibold text-white">
                <Upload className="h-3.5 w-3.5" />
                Add images
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  className="hidden"
                  disabled={saving || replacing}
                  onChange={(event) => {
                    setImagesTouched(true);
                    void addFiles(event.target.files);
                    event.target.value = "";
                  }}
                />
              </label>
            </div>

            <div
              className={cn(
                "rounded-lg border border-dashed border-[#93C5FD] bg-white text-center transition-colors",
                images.length ? "px-3 py-2" : "px-4 py-5",
              )}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                if (event.dataTransfer.files?.length) {
                  setImagesTouched(true);
                  void addFiles(event.dataTransfer.files);
                }
              }}
            >
              <p className="text-sm font-medium text-[#0B1F3A]">
                Drag and drop images here
              </p>
              <p className="mt-0.5 text-xs text-[#647A9B]">
                {BANNER_IMAGE_WIDTH} × {BANNER_IMAGE_HEIGHT} px
              </p>
            </div>

            {imageError || (showImages && !images.length) ? (
              <p role="alert" className="mt-2 text-sm text-red-500">
                {imageError ?? "Add at least one banner image."}
              </p>
            ) : null}
            {uploadLabel ? (
              <p className="mt-2 text-xs font-medium text-[#2563EB]">{uploadLabel}</p>
            ) : null}

            {images.length ? (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {images.map((image, index) => {
                  const linkTouched = Boolean(touchedLinks[image.key]) || submitted;
                  const linkInvalid = !isValidBannerLink(image.link);
                  const linkState: FieldVisualState = !linkTouched
                    ? "neutral"
                    : linkInvalid
                      ? "invalid"
                      : image.link.trim()
                        ? "valid"
                        : "neutral";

                  return (
                    <article
                      key={image.key}
                      draggable={!saving && !replacing}
                      onDragStart={() => setDragKey(image.key)}
                      onDragOver={(event) => {
                        event.preventDefault();
                        if (dragKey) {
                          setDropKey(image.key);
                        }
                      }}
                      onDrop={(event) => {
                        if (!dragKey) {
                          return;
                        }

                        event.preventDefault();
                        event.stopPropagation();
                        reorderImages(dragKey, image.key);
                        setDragKey(null);
                        setDropKey(null);
                      }}
                      onDragEnd={() => {
                        setDragKey(null);
                        setDropKey(null);
                      }}
                      className={cn(
                        "overflow-hidden rounded-xl border bg-white shadow-sm transition-colors",
                        image.isPrimary
                          ? "border-[#2563EB] ring-2 ring-[#2563EB]/20"
                          : "border-[#E1EBF5]",
                        dropKey === image.key && dragKey !== image.key
                          ? "border-[#0EA5E9] ring-2 ring-[#0EA5E9]/30"
                          : "",
                        dragKey === image.key ? "opacity-60" : "",
                      )}
                    >
                      <div className="relative aspect-[1920/750] bg-slate-100">
                        {image.previewUrl ? (
                          <img
                            src={image.previewUrl}
                            alt=""
                            className="h-full w-full object-cover object-center"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-slate-400">
                            <ImageOff className="h-5 w-5" />
                          </div>
                        )}
                        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-white/95 px-1.5 py-0.5 text-[10px] font-semibold text-[#102A56] shadow-sm">
                          <GripVertical className="h-3 w-3 text-slate-400" />
                          {index + 1}
                        </span>
                        {image.isPrimary ? (
                          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md bg-[#2563EB] px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                            <Star className="h-3 w-3 fill-white" />
                            Primary
                          </span>
                        ) : null}
                      </div>
                      <div className="grid grid-cols-3 gap-1 border-t border-[#E8F1FF] p-2">
                        <button
                          type="button"
                          className={cn(
                            "inline-flex items-center justify-center gap-1 rounded-md border px-1.5 py-1 text-[11px] font-semibold",
                            image.isPrimary
                              ? "border-[#2563EB] bg-[#EFF6FF] text-[#1D4ED8]"
                              : "border-[#DCE8F5] bg-white text-[#102A56] hover:bg-[#F8FBFF]",
                          )}
                          disabled={saving || replacing}
                          onClick={() => setPrimary(image.key)}
                        >
                          <Star className="h-3 w-3" />
                          Set Primary
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center gap-1 rounded-md border border-[#DCE8F5] bg-white px-1.5 py-1 text-[11px] font-semibold text-[#102A56] hover:bg-[#F8FBFF] disabled:opacity-40"
                          disabled={saving || replacing || index === 0}
                          onClick={() => moveImage(index, -1)}
                        >
                          <ArrowUp className="h-3 w-3" />
                          Move Up
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center gap-1 rounded-md border border-[#DCE8F5] bg-white px-1.5 py-1 text-[11px] font-semibold text-[#102A56] hover:bg-[#F8FBFF] disabled:opacity-40"
                          disabled={saving || replacing || index === images.length - 1}
                          onClick={() => moveImage(index, 1)}
                        >
                          <ArrowDown className="h-3 w-3" />
                          Move Down
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center gap-1 rounded-md border border-[#DCE8F5] bg-white px-1.5 py-1 text-[11px] font-semibold text-[#2563EB] hover:bg-[#F8FBFF] disabled:opacity-40"
                          disabled={saving || replacing}
                          onClick={() => {
                            replaceKeyRef.current = image.key;
                            replaceInputRef.current?.click();
                          }}
                        >
                          <RefreshCw className="h-3 w-3" />
                          Replace
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center gap-1 rounded-md border border-red-100 bg-white px-1.5 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-50 disabled:opacity-40"
                          disabled={saving || replacing}
                          onClick={() => {
                            setImagesTouched(true);
                            setImages((current) => {
                              const next = current.filter(
                                (item) => item.key !== image.key,
                              );
                              if (
                                next.length > 0 &&
                                !next.some((item) => item.isPrimary)
                              ) {
                                next[0] = { ...next[0]!, isPrimary: true };
                              }
                              return next;
                            });
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </button>
                        <span className="inline-flex items-center justify-center gap-1 rounded-md border border-transparent px-1.5 py-1 text-[11px] font-semibold text-[#647A9B]">
                          <Link2 className="h-3 w-3" />
                          Link (Optional)
                        </span>
                      </div>
                      <div className="border-t border-[#E8F1FF] px-2 pb-2">
                        <Input
                          value={image.link}
                          placeholder="https://example.com/courses"
                          disabled={saving || replacing}
                          className={cn(
                            "h-8 rounded-lg px-2 text-xs",
                            linkState === "invalid" && "border-red-300",
                            linkState === "valid" && "border-emerald-400",
                          )}
                          onBlur={() =>
                            setTouchedLinks((current) => ({
                              ...current,
                              [image.key]: true,
                            }))
                          }
                          onChange={(event) =>
                            updateLink(image.key, event.target.value)
                          }
                        />
                        {linkState === "invalid" ? (
                          <p role="alert" className="mt-1 text-xs text-red-500">
                            Enter a valid http or https link.
                          </p>
                        ) : linkState === "valid" ? (
                          <p className="mt-1 text-xs text-emerald-600">Looks good</p>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : null}
          </section>

          <input
            ref={replaceInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(event) => {
              const key = replaceKeyRef.current;
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!key) {
                return;
              }
              void replaceFile(key, file);
            }}
          />

          <div className="flex justify-end gap-2 border-t border-[#E8F1FF] pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving || replacing}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={saving || replacing}
              className="border-0 bg-gradient-to-r from-[#0EA5E9] to-[#2563EB] text-white"
              onClick={() => void save()}
            >
              {saving ? "Saving..." : isEdit ? "Save changes" : "Create banner"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
