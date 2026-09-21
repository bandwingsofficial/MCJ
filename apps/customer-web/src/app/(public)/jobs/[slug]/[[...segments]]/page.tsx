import { JobSlugRoutePage } from "@/src/features/jobs/pages/job-slug-route-page";

interface Props {
  params: Promise<{
    slug: string;
    segments?: string[];
  }>;
}

export default function Page(props: Props) {
  return <JobSlugRoutePage {...props} />;
}
