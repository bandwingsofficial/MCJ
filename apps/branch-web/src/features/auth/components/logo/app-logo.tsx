import Image from "next/image";

export function AppLogo() {
  return (
    <Image
      src="/Logo/MCJ_logo.png"
      alt="MCJ Logo"
      width={90}
      height={90}
      priority
    />
  );
}