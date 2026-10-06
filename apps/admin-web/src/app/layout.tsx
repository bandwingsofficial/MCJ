import "@/src/styles/globals.css";

import type { Metadata } from "next";
import { MCJ_ROOT_METADATA_TITLE } from "@mcj/shared-constants";
import { Toaster } from "sonner";

import { AppProviders } from "@/src/providers/app-providers";

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
        <AppProviders>
          {children}
        </AppProviders>

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
