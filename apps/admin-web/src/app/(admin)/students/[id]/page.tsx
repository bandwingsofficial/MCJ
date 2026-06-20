import { StudentDetailsPage } from "@/src/features/students/pages/StudentDetailsPage";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({
  params,
}: Props) {
  const { id } =
    await params;

  return (
    <StudentDetailsPage
      id={id}
    />
  );
}