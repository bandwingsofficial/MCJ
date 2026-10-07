import { RegisterPage } from "@/src/features/auth/pages/register.page";

export default function InterceptedRegisterPage() {
  return <RegisterPage closeMode="back" />;
}
