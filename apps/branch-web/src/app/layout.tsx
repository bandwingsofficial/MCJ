import "@/src/styles/globals.css";

import type { Metadata } from "next";
import { MCJ_ROOT_METADATA_TITLE } from "@mcj/shared-constants";
import { Toaster } from "sonner";

import { AppProvider } from "@/src/core/providers/app-provider";

export const metadata: Metadata = {
  title: MCJ_ROOT_METADATA_TITLE,
};

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