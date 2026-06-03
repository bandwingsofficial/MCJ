import "@/src/styles/globals.css";

import { Toaster } from "sonner";

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
          {children}
        </AuthProvider>

        <Toaster
          position="top-right"
          richColors
          closeButton
          expand={false}
          duration={3000}
          visibleToasts={5}
        />
      </body>
    </html>
  );
}