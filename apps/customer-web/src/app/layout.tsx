import "@/src/styles/globals.css";

import type { Metadata } from "next";
import Script from "next/script";
import { MCJ_ROOT_METADATA_TITLE } from "@mcj/shared-constants";
import { Toaster } from "sonner";

import { AuthModalControllerProvider } from "@/src/features/auth/components/auth-modal-controller";
import { AuthProvider } from "@/src/providers/auth-provider";
import { QueryProvider } from "@/src/core/providers/query-provider";
import { AppProvider } from "@/src/core/providers/app-provider";
import { DocumentTitleProvider } from "@/src/shared/document-title/document-title-provider";

export const metadata: Metadata = {
  title: MCJ_ROOT_METADATA_TITLE,
  description:
    "MCJ Institute of Accounting offers industry-aligned programs in Tally, GST, HR Payroll, and financial accounting.",
  metadataBase: new URL("https://mcjacademy.com"),
  icons: {
    icon: "/favicon.ico",
  },
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
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1685499549276396');
            fbq('track', 'PageView');
          `}
        </Script>

        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1685499549276396&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>

        <QueryProvider>
          <AppProvider>
            <AuthProvider>
              <AuthModalControllerProvider>
                <DocumentTitleProvider>
                  {children}
                  {authModal}
                </DocumentTitleProvider>
              </AuthModalControllerProvider>

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