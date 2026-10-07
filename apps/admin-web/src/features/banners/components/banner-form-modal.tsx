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
import { ArrowDown, ArrowUp, ImageOff, Link2, RefreshCw, Star, Trash2 } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Modal } from "@/src/shared/components/ui/model";
import { appToast } from "@/src/shared/components/ui/toast";
import { cn } from "@/src/shared/lib/cn";

import { bannerService } from "@/src/features/banners/services/banner.service";
import type {
  BannerDetail,
  BannerPlacement,
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
  const [images, setImages] = useState<DraftImage[]>([]);
  const [nameError, setNameError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
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

    if (!bannerId) {
      setName("");
      setType("HOMEPAGE");
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

  const save = async () => {
    const trimmed = name.trim();

    if (trimmed.length < 2) {
      setNameError("Banner name is required.");
      return;
    }

    if (!images.length) {
      setImageError("Add at least one banner image.");
      return;
    }

    if (images.some((image) => !isValidBannerLink(image.link))) {
      setImageError("Enter a valid link for each image, including https://.");
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
        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#102A56]">
              Banner Name
            </label>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Homepage Main Banner"
                disabled={saving || replacing}
            />
            {nameError ? (
              <p className="mt-1 text-xs text-red-600">{nameError}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#102A56]">
              Banner Type
            </label>
            <AppSelect
              value={type}
              options={BANNER_PLACEMENTS.map((item) => ({
                value: item.value,
                label: item.label,
              }))}
              onValueChange={(value) => setType(value as BannerPlacement)}
                disabled={saving || replacing}
            />
          </div>

          <div className="rounded-lg border border-[#E1EBF5] bg-[#F8FBFF] px-3 py-2 text-xs text-[#334155]">
            <p>
              Required Banner Resolution: {BANNER_IMAGE_WIDTH} × {BANNER_IMAGE_HEIGHT} px
            </p>
            <p className="mt-1">
              Images will be automatically resized to fit the banner.
            </p>
            <p className="mt-1">Supported formats: PNG, JPG, JPEG, WEBP</p>
            <p className="mt-1">
              Up to {BANNER_MAX_IMAGES_PER_GROUP} images. The first image is
              primary unless you choose another.
            </p>
          </div>

          <div
            className="rounded-xl border border-dashed border-[#BFDBFE] bg-white px-4 py-6 text-center"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              void addFiles(event.dataTransfer.files);
            }}
          >
            <p className="text-sm font-medium text-[#0B1F3A]">
              Drag and drop banner images
            </p>
            <p className="mt-1 text-xs text-slate-500">or browse files</p>
            <label className="mt-3 inline-flex cursor-pointer rounded-lg bg-[#2563EB] px-3 py-2 text-xs font-semibold text-white">
              Browse
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                className="hidden"
                disabled={saving || replacing}
                onChange={(event) => {
                  void addFiles(event.target.files);
                  event.target.value = "";
                }}
              />
            </label>
          </div>

          {imageError ? (
            <p className="text-xs text-red-600">{imageError}</p>
          ) : null}
          {uploadLabel ? (
            <p className="text-xs font-medium text-[#2563EB]">{uploadLabel}</p>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            {images.map((image, index) => (
              <article
                key={image.key}
                className="overflow-hidden rounded-lg border border-slate-200 bg-white"
              >
                <div className="relative aspect-[1920/750] bg-slate-100">
                  {image.previewUrl ? (
                    <img
                      src={image.previewUrl}
                      alt=""
                      className="h-full w-full object-contain object-center"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400">
                      <ImageOff className="h-5 w-5" />
                    </div>
                  )}
                  <span className="absolute left-2 top-2 rounded bg-white/95 px-1.5 py-0.5 text-[10px] font-semibold text-[#0B1F3A]">
                    {index + 1}
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 px-2 py-2">
                  <button
                    type="button"
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold",
                      image.isPrimary
                        ? "bg-[#FEF3C7] text-[#92400E]"
                        : "bg-slate-100 text-slate-600",
                    )}
                    disabled={saving || replacing}
                    onClick={() => setPrimary(image.key)}
                  >
                    <Star className="h-3 w-3" />
                    {image.isPrimary ? "Primary" : "Set primary"}
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label="Replace image"
                      className="inline-flex items-center gap-1 rounded px-1.5 py-1 text-[11px] font-semibold text-[#2563EB] hover:bg-slate-100 disabled:opacity-50"
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
                      aria-label="Move up"
                      className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                      disabled={saving || replacing}
                      onClick={() => moveImage(index, -1)}
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Move down"
                      className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                      disabled={saving || replacing}
                      onClick={() => moveImage(index, 1)}
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Remove image"
                      className="rounded p-1 text-red-600 hover:bg-red-50 disabled:opacity-50"
                      disabled={saving || replacing}
                      onClick={() =>
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
                        })
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="border-t border-slate-100 px-2 py-2">
                  <label className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                    <Link2 className="h-3 w-3" />
                    Link
                  </label>
                  <Input
                    value={image.link}
                    placeholder="https://mcjacademy.com/courses"
                    disabled={saving || replacing}
                    className="h-8 rounded-lg px-2 text-xs"
                    onChange={(event) => updateLink(image.key, event.target.value)}
                  />
                </div>
              </article>
            ))}
          </div>

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
