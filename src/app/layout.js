import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'] });

export const metadata = {
  title: 'Restaran — Restaurant Management Platform',
  description: 'Premium restaurant management SaaS — manage orders, kitchen, staff, and expenses all in one beautiful dashboard.',
};

import { LanguageProvider } from '@/contexts/LanguageContext';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
