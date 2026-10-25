import type { Metadata, Viewport } from 'next';
import './globals.css';
import '@blocknote/mantine/style.css';
import '@blocknote/core/fonts/inter.css';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: "Laksha's WorkSpace",
  description:
    "Laksha's WorkSpace - Connected workspace & AI clinical assistant powered by Next.js, Gemini Flash, and Supabase.",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: "Laksha's WorkSpace",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  themeColor: '#7c3aed',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="min-h-full flex flex-col bg-white dark:bg-[#191919] text-neutral-900 dark:text-neutral-100 font-sans selection:bg-purple-200 selection:text-purple-900 transition-colors duration-150">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
