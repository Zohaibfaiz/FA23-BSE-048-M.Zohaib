import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { Toaster as SonnerToaster } from 'sonner';

export const metadata: Metadata = {
  title: { default: 'AdFlow Pro', template: '%s | AdFlow Pro' },
  description: 'Pakistan\'s Premium Sponsored Listing Marketplace — Post, Promote & Grow',
  keywords: ['ads', 'classifieds', 'sponsored listings', 'Pakistan', 'AdFlow Pro'],
  openGraph: {
    title: 'AdFlow Pro',
    description: 'Pakistan\'s Premium Sponsored Listing Marketplace',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className="min-h-screen grid-bg"
        style={{ fontFamily: 'var(--font-dm-sans)' }}
      >
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#16162a',
              color: '#f0f0ff',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: '12px',
            },
          }}
        />
        <SonnerToaster theme="dark" richColors position="top-right" />
      </body>
    </html>
  );
}
