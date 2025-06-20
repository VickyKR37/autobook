
import type { Metadata } from 'next';
// import { Geist, Geist_Mono } from 'next/font/google'; // Temporarily commented out
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import AppLayout from '@/components/layout/app-layout';
import { AuthProvider } from '@/context/auth-provider';

// const geistSans = Geist({ // Temporarily commented out
//   variable: '--font-geist-sans',
//   subsets: ['latin'],
// });

// const geistMono = Geist_Mono({ // Temporarily commented out
//   variable: '--font-geist-mono',
//   subsets: ['latin'],
// });

export const metadata: Metadata = {
  title: 'AutoBook - Your Car Management App',
  description: 'Comprehensive app to track all car details for mechanics.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}> // Temporarily commented out */}
      <body className="antialiased"> {/* Fallback basic body class */}
        {/* AuthProvider wraps AppLayout and Toaster, crucial for auth context */}
        <AuthProvider> 
          <AppLayout>
            {children}
          </AppLayout>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
