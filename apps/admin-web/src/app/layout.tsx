import "@/src/styles/globals.css";

import { Toaster } from "sonner";

import { AppProviders } from "@/src/providers/app-providers";

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
