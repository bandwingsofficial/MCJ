import { redirect } from "next/navigation";

interface Props {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function LegacyCompanyJobApplicationSuccessPage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params;
  const query = await searchParams;
  const next = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (typeof value === "string") {
      next.set(key, value);
    }
  }

  const suffix = next.toString();
  redirect(
    `/jobs/${encodeURIComponent(slug)}/apply/success${suffix ? `?${suffix}` : ""}`,
  );
}
