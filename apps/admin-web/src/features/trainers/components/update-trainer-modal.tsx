"use client";



import { useEffect, useState } from "react";



import { Modal } from "@/src/shared/components/ui/model";



import { EditTrainerForm } from "./edit-trainer-form";



import { useUpdateTrainer } from "@/src/features/trainers/hooks/use-update-trainer";

import { trainerService } from "@/src/features/trainers/services/trainer.service";



import type {

  UpdateTrainerFormValues,

} from "@/src/features/trainers/schemas/trainer.schema";



import type {

  TrainerDetails,

  TrainerListItem,

  UpdateTrainerRequest,

} from "@/src/features/trainers/types/trainer.types";

import { appToast } from "@/src/shared/components/ui/toast";



import { getErrorMessage } from "@/src/core/utils/get-error-message";



import { formatJoinedAtForApi } from "@/src/features/trainers/utils/trainer-date.util";
import { normalizePhoneForIndianForm } from "@/src/features/trainers/utils/trainer-form-normalize.utils";

import { getUploadFileId } from "@/src/shared/utils/upload-image.util";



interface UpdateTrainerModalProps {

  open: boolean;

  trainer: TrainerListItem | null;

  onClose: () => void;

  onSuccess: () => void | Promise<void>;

}



/**
 * Optional text field for an update: the form always provides the field, so
 * an empty value is an explicit clear and must reach the API as `null`
 * (omitting it would mean "leave unchanged").
 */
function toNullableText(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? "";

  return trimmed === "" ? null : trimmed;
}

function toNullableNumber(value: number | undefined): number | null {
  return typeof value === "number" && !Number.isNaN(value) ? value : null;
}

function toUpdatePayload(

  values: UpdateTrainerFormValues,

  details: TrainerDetails,

  profileImageFileId?: string | null,

): UpdateTrainerRequest {

  return {

    firstName: values.firstName.trim(),

    lastName: toNullableText(values.lastName),

    email: values.email.trim(),

    phone: normalizePhoneForIndianForm(values.phone),

    gender: values.gender,

    bio: toNullableText(values.bio),

    qualification: toNullableText(values.qualification),

    experienceYears: toNullableNumber(values.experienceYears),

    specialization: toNullableText(values.specialization),

    skills: values.skills,

    employeeCode:
      values.employeeCode?.trim() ||
      details.employeeCode?.trim() ||
      undefined,

    trainerType: values.trainerType,

    linkedInUrl: toNullableText(values.linkedInUrl),

    youtubeUrl: toNullableText(values.youtubeUrl),

    instagramUrl: toNullableText(values.instagramUrl),

    isFeatured: details.isFeatured,

    joinedAt: formatJoinedAtForApi(values.joinedAt) ?? null,

    profileImageFileId,

  };

}



export function UpdateTrainerModal({

  open,

  trainer,

  onClose,

  onSuccess,

}: UpdateTrainerModalProps) {

  const { updateTrainer, isPending } = useUpdateTrainer();

  const [details, setDetails] = useState<TrainerDetails | null>(

    null

  );

  const [isLoadingDetails, setIsLoadingDetails] =

    useState(false);

  const [isUploadingImage, setIsUploadingImage] = useState(false);



  useEffect(() => {

    if (!open || !trainer) {

      setDetails(null);

      return;

    }



    let cancelled = false;



    const loadDetails = async () => {

      try {

        setIsLoadingDetails(true);

        const response = await trainerService.getTrainer(

          trainer.id

        );



        if (!cancelled) {

          setDetails(response.data);

        }

      } catch {

        if (!cancelled) {

          setDetails(null);

        }

      } finally {

        if (!cancelled) {

          setIsLoadingDetails(false);

        }

      }

    };



    void loadDetails();



    return () => {

      cancelled = true;

    };

  }, [open, trainer?.id]);



  if (!open) {

    return null;

  }



  const handleSubmit = async (

    values: UpdateTrainerFormValues,

    image: File | null,

    removeImage?: boolean,

  ) => {

    if (!trainer || !details) {

      return;

    }



    try {

      let profileImageFileId: string | null | undefined;



      if (image) {

        setIsUploadingImage(true);



        try {

          const uploadResponse =

            await trainerService.uploadTrainerImage(image);

          profileImageFileId = getUploadFileId(uploadResponse);

        } finally {

          setIsUploadingImage(false);

        }

      } else if (removeImage) {

        profileImageFileId = null;

      }



      const payload = toUpdatePayload(values, details, profileImageFileId);

      const success = await updateTrainer(trainer.id, payload);



      if (success) {

        await onSuccess();

        onClose();

      }

    } catch (error) {

      appToast.error(getErrorMessage(error));

    }

  };



  return (

    <Modal

      open={open}

      title="Update Trainer"

      onClose={onClose}

      bodyClassName="overflow-y-auto bg-white px-6 py-5"

    >

      {isLoadingDetails || !details ? (

        <p className="py-6 text-sm text-[#647A9B]">

          Loading trainer details…

        </p>

      ) : (

        <EditTrainerForm

          key={`${details.id}-${details.updatedAt}`}

          trainer={details}

          submitLabel="Update Trainer"

          isSubmitting={isPending || isUploadingImage}

          onSubmit={handleSubmit}

        />

      )}

    </Modal>

  );

}

