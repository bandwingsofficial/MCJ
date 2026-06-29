import { Header } from "@/src/shared/components/header/header";
import { Footer } from "@/src/shared/components/footer/footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />

      <main>{children}</main>

      <Footer />
    </>
  );
}