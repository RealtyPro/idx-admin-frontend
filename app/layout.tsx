import "./globals.css";
import type { Metadata, Viewport } from "next";
import React from "react";
import Providers from "./provider/QueryProvider";
import { ThemeProvider } from "./provider/ThemeProvider";

export const metadata: Metadata = {
  title: "RealtiPro - Admin",
  description: "RealtiPro Admin",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <Providers>
        <body>
          <ThemeProvider>{children}</ThemeProvider>
        </body>
      </Providers>
    </html>
  );
}
