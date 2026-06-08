import "@/src/styles/globals.css";

import { Toaster } from "sonner";

import { Header } from "@/src/shared/components/header/header";
import { Footer } from "@/src/shared/components/footer/footer";

import { AuthProvider } from "@/src/providers/auth-provider";

import { QueryProvider } from "@/src/core/providers/query-provider";
import { AppProvider } from "@/src/core/providers/app-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <AppProvider>
            <AuthProvider>
              <Header />

              {children}

              <Footer />

              <Toaster
                position="top-right"
                richColors
                closeButton
                duration={4000}
              />
            </AuthProvider>
          </AppProvider>
        </QueryProvider>
      </body>
    </html>
  );
}