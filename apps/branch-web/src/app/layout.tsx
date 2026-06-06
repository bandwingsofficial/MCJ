import "@/src/styles/globals.css";

import { Toaster } from "sonner";

import { AppProvider } from "@/src/core/providers/app-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          {children}
        </AppProvider>

        <Toaster
          richColors
          position="top-right"
          closeButton
        />
      </body>
    </html>
  );
}