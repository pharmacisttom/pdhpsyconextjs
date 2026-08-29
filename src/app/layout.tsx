import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/layout/Providers';

export const metadata: Metadata = {
  title: 'PDHPSYCO | ระบบคัดกรองสุขภาพจิตและติดตามผล โรงพยาบาลปลวกแดง',
  description:
    'ระบบคัดกรองสุขภาพจิตออนไลน์และระบบบริหารจัดการติดตามผล โรงพยาบาลปลวกแดง จังหวัดระยอง บริการประเมินภาวะซึมเศร้า ความเครียด และความเสี่ยงทำร้ายตนเองอย่างปลอดภัยและเป็นความลับ',
  keywords: ['สุขภาพจิต', 'คัดกรองซึมเศร้า', 'โรงพยาบาลปลวกแดง', 'PDHPSYCO', '2Q', '9Q', '8Q', 'ST5', 'ระยอง'],
  authors: [{ name: 'โรงพยาบาลปลวกแดง (Pluak Daeng Hospital)' }],
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sarabun:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen font-sans bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 flex flex-col antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
