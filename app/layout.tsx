import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Drilling RPG - 심해 드릴 어드벤처',
  description: '지하 깊은 곳을 탐험하는 드릴링 RPG 게임입니다.',
  icons: {
    icon: 'favicon.ico',
  },
};

/**
 * 어플리케이션의 루트 레이아웃입니다.
 * 폰트 설정 및 기본 HTML 구조를 정의합니다.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8319588891960553" 
          crossOrigin="anonymous"
        ></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
