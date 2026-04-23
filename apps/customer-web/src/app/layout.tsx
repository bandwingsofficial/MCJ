import "@/src/styles/globals.css";
import { Header } from "@/src/shared/components/header/header";
import { Footer } from "@/src/shared/components/footer/footer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}