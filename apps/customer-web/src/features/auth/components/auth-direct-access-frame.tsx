import { HomePage } from "@/src/features/home/home-page";
import { Footer } from "@/src/shared/components/footer/footer";
import { Header } from "@/src/shared/components/header/header";

export function AuthDirectAccessFrame({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="min-w-0 overflow-x-clip">
        <HomePage />
      </main>
      <Footer />
      {children}
    </>
  );
}
