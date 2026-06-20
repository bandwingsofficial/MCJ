import { StudentEditPage } from "@/src/features/students/pages/StudentEditPage";

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
    <StudentEditPage
      id={id}
    />
  );
}