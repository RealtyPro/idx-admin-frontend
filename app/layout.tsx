import './globals.css'
import type { Metadata } from 'next';
import React from 'react';
import Providers from './provider/QueryProvider';

export const metadata: Metadata = {
  title: 'RealtiPro - Smart Interaction Logger',
  description: 'Capture, Store, and Analyze WhatsApp & call interactions with ease.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
            <Providers>

      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>

      <body>{children}</body>
      </Providers>
    </html>

  )
} 