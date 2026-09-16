import "@/src/styles/globals.css";

import { Toaster } from "sonner";

import { AppProvider } from "@/src/core/providers/app-provider";
import { QueryProvider } from "@/src/core/providers/query-provider";

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
            {children}
            <Toaster position="top-right" richColors closeButton duration={4000} />
          </AppProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
