"use client";

import type { JobApplication } from "@/src/features/job-applications/types/job-application.types";
import {
  getOptionalApplicationRemarksOther,
  parseApplicationRemarks,
} from "@/src/features/job-applications/utils/job-application-display.utils";

interface StructuredAdditionalNotes {
  collegeName: string | null;
  specialization: string | null;
  passingYear: string | null;
  addressBlock: string | null;
  freeText: string | null;
}

function hasText(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim() !== "";
}

function readStringField(
  source: Record<string, unknown>,
  key: string,
): string | null {
  const value = source[key];
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return null;
}

function tryParseJsonObject(
  raw: string | null | undefined,
): Record<string, unknown> | null {
  if (!raw?.trim()) {
    return null;
  }
  const trimmed = raw.trim();
  if (!trimmed.startsWith("{")) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    return null;
  }
  return null;
}

function formatAddressFromJson(source: Record<string, unknown>): string | null {
  const line1 = readStringField(source, "addressLine1");
  const line2 = readStringField(source, "addressLine2");
  const city = readStringField(source, "city");
  const state = readStringField(source, "state");
  const country = readStringField(source, "country");
  const postalCode = readStringField(source, "postalCode");

  const lines: string[] = [];
  if (line1) {
    lines.push(line1);
  }
  if (line2) {
    lines.push(line2);
  }

  const locality = [city, state, country].filter(Boolean).join(", ");
  const localityWithPostal = locality
    ? postalCode
      ? `${locality} - ${postalCode}`
      : locality
    : postalCode;

  if (localityWithPostal) {
    lines.push(localityWithPostal);
  }

  return lines.length ? lines.join("\n") : null;
}

function resolveStructuredAdditionalNotes(
  application: JobApplication,
): StructuredAdditionalNotes | null {
  const candidates = [
    application.coverLetter,
    application.remarks,
    getOptionalApplicationRemarksOther(application),
  ];

  for (const candidate of candidates) {
    const json = tryParseJsonObject(candidate);
    if (!json) {
      continue;
    }

    const collegeName = readStringField(json, "collegeName");
    const specialization = readStringField(json, "specialization");
    const passingYear = readStringField(json, "passingYear");
    const addressBlock = formatAddressFromJson(json);

    if (collegeName || specialization || passingYear || addressBlock) {
      return {
        collegeName,
        specialization,
        passingYear,
        addressBlock,
        freeText: null,
      };
    }
  }

  return null;
}

function resolveFreeTextNotes(application: JobApplication): string | null {
  const parsed = parseApplicationRemarks(application.remarks);
  const parts: string[] = [];

  if (hasText(parsed.other)) {
    const json = tryParseJsonObject(parsed.other);
    if (!json) {
      parts.push(parsed.other.trim());
    }
  }

  if (hasText(application.coverLetter)) {
    const json = tryParseJsonObject(application.coverLetter);
    if (!json) {
      parts.push(application.coverLetter.trim());
    }
  }

  if (!parts.length) {
    return null;
  }

  return parts.join("\n\n");
}

function NoteField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wide text-[#647A9B]">
        {label}
      </p>
      <p className="mt-1 whitespace-pre-wrap text-sm text-[#102A56]">{value}</p>
    </div>
  );
}

interface Props {
  application: JobApplication;
}

export function ApplicationAdditionalNotesSection({ application }: Props) {
  const structured = resolveStructuredAdditionalNotes(application);
  const freeText = resolveFreeTextNotes(application);

  if (!structured && !freeText) {
    return (
      <p className="text-sm text-[#647A9B]">No additional notes.</p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {structured?.collegeName ? (
        <NoteField label="College Name" value={structured.collegeName} />
      ) : null}
      {structured?.specialization ? (
        <NoteField label="Specialization" value={structured.specialization} />
      ) : null}
      {structured?.passingYear ? (
        <NoteField label="Passing Year" value={structured.passingYear} />
      ) : null}
      {structured?.addressBlock ? (
        <div className="min-w-0 sm:col-span-2">
          <NoteField label="Address" value={structured.addressBlock} />
        </div>
      ) : null}
      {freeText ? (
        <div className="min-w-0 sm:col-span-2">
          <NoteField label="Notes" value={freeText} />
        </div>
      ) : null}
    </div>
  );
}

export function hasApplicationAdditionalNotes(
  application: JobApplication,
): boolean {
  return (
    resolveStructuredAdditionalNotes(application) != null ||
    resolveFreeTextNotes(application) != null
  );
}
