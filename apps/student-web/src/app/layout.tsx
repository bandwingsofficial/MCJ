import "@/src/styles/globals.css";

import type { Metadata } from "next";
import { MCJ_ROOT_METADATA_TITLE } from "@mcj/shared-constants";
import { Toaster } from "sonner";

import { AppProvider } from "@/src/core/providers/app-provider";
import { QueryProvider } from "@/src/core/providers/query-provider";
import { DocumentTitleProvider } from "@/src/shared/document-title/document-title-provider";

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
        <QueryProvider>
          <AppProvider>
            <DocumentTitleProvider>
              {children}
              <Toaster position="top-right" richColors closeButton duration={4000} />
            </DocumentTitleProvider>
          </AppProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
