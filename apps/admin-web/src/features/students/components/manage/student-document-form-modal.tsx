"use client";

import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/src/shared/components/ui/button";
import { FileUploadField } from "@/src/shared/components/ui/file-upload-field";
import { Input } from "@/src/shared/components/ui/input";
import { Modal } from "@/src/shared/components/ui/model";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Textarea } from "@/src/shared/components/ui/textarea";
import { Label } from "@/src/shared/components/ui/label";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { STUDENT_DOCUMENT_TYPE_OPTIONS } from "@/src/features/students/constants/student.constants";
import { studentService } from "@/src/features/students/services/student.service";
import type {
  StudentDocument,
  StudentDocumentType,
} from "@/src/features/students/types/student.types";

const DOCUMENT_ACCEPT =
  "image/jpeg,image/png,image/webp,image/avif,application/pdf";
const DESCRIPTION_MAX_LENGTH = 1000;

interface Props {
  open: boolean;
  studentId: string;
  document?: StudentDocument | null;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
}

export function StudentDocumentFormModal({
  open,
  studentId,
  document,
  onClose,
  onSuccess,
}: Props) {
  const isEdit = Boolean(document);
  const [name, setName] = useState("");
  const [type, setType] = useState<StudentDocumentType>("MARKS_CARD");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setName(document?.name ?? "");
    setType(document?.type ?? "MARKS_CARD");
    setDescription(document?.description ?? "");
    setFile(null);
    setNameError(null);
    setFileError(null);
  }, [open, document]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError("Document name is required");
      return;
    }

    if (!isEdit && !file) {
      setFileError("Please choose a file to upload");
      return;
    }

    try {
      setIsSubmitting(true);

      let fileId: string | undefined;

      if (file) {
        const uploadResponse = await studentService.uploadStudentDocument(file);
        fileId = uploadResponse.data.fileId;
      }

      if (isEdit && document) {
        await studentService.updateStudentDocument(studentId, document.id, {
          name: trimmedName,
          type,
          description: description.trim(),
          ...(fileId ? { fileId } : {}),
        });
        appToast.success("Document updated successfully");
      } else {
        if (!fileId) {
          setFileError("Please choose a file to upload");
          return;
        }

        await studentService.createStudentDocument(studentId, {
          name: trimmedName,
          type,
          fileId,
          description: description.trim() || undefined,
        });
        appToast.success("Document uploaded successfully");
      }

      await onSuccess();
      onClose();
    } catch (error) {
      appToast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title={isEdit ? "Edit Document" : "Add Document"}
      onClose={onClose}
      contentClassName="!flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-3xl flex-col !overflow-hidden"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label required>Document Name</Label>
          <Input
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (nameError) {
                setNameError(null);
              }
            }}
            placeholder="Enter document name"
            disabled={isSubmitting}
          />
          {nameError ? (
            <p className="mt-1 text-xs text-red-600">{nameError}</p>
          ) : null}
        </div>

        <div>
          <Label required>Document Type</Label>
          <AppSelect
            value={type}
            onValueChange={(value) => setType(value as StudentDocumentType)}
            options={[...STUDENT_DOCUMENT_TYPE_OPTIONS]}
            disabled={isSubmitting}
            placeholder="Select document type"
          />
        </div>

        <div>
          <Label required={!isEdit}>
            {isEdit ? "Replace File" : "File"}
          </Label>
          <FileUploadField
            file={file}
            existingFileName={document?.fileName}
            existingFileUrl={document?.fileUrl}
            disabled={isSubmitting}
            accept={DOCUMENT_ACCEPT}
            hint="PDF or image files"
            browseLabel="Browse File"
            onFileSelect={(selected) => {
              setFile(selected);
              if (fileError) {
                setFileError(null);
              }
            }}
          />
          {fileError ? (
            <p className="mt-1 text-xs text-red-600">{fileError}</p>
          ) : null}
        </div>

        <div>
          <Label>Description / Notes</Label>
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Optional notes"
            rows={4}
            maxLength={DESCRIPTION_MAX_LENGTH}
            disabled={isSubmitting}
          />
          <p className="mt-1 text-right text-xs tabular-nums text-slate-500">
            {Math.min(description.length, DESCRIPTION_MAX_LENGTH)}/
            {DESCRIPTION_MAX_LENGTH} characters
          </p>
        </div>

        <div className="sticky bottom-0 mt-4 flex shrink-0 justify-end gap-3 border-t border-slate-200 bg-white pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEdit ? "Save Changes" : "Add Document"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
