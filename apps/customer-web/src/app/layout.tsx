import "@/src/styles/globals.css";

import type { Metadata } from "next";
import { MCJ_ROOT_METADATA_TITLE } from "@mcj/shared-constants";
import { Toaster } from "sonner";

import { AuthProvider } from "@/src/providers/auth-provider";
import { QueryProvider } from "@/src/core/providers/query-provider";
import { AppProvider } from "@/src/core/providers/app-provider";
import { DocumentTitleProvider } from "@/src/shared/document-title/document-title-provider";

export const metadata: Metadata = {
  title: MCJ_ROOT_METADATA_TITLE,
};

export default function RootLayout({
  children,
  authModal,
}: {
  children: React.ReactNode;
  authModal: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <AppProvider>
            <AuthProvider>
              <DocumentTitleProvider>
                {children}
                {authModal}
              </DocumentTitleProvider>

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