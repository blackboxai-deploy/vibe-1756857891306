import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Notion-like Productivity App',
  description: 'Una aplicación de productividad moderna con editor de bloques, IA y plantillas.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="h-screen flex overflow-hidden bg-gray-50">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}