import "@/src/styles/globals.css";
import { Header } from "@/src/shared/components/header/header";
import { Footer } from "@/src/shared/components/footer/footer";
import { AuthProvider } from "@/src/providers/auth-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Header />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}