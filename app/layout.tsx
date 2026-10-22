import type { Metadata, Viewport } from 'next';
import './globals.css';
import '@blocknote/mantine/style.css';
import '@blocknote/core/fonts/inter.css';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'Notion AI - Connected Workspace & AI Assistant',
  description:
    'A full-featured Notion clone powered by Next.js, Google Gemini, Supabase PostgreSQL, and BlockNote.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Notion AI',
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
