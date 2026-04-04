import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
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
  title: 'Drilling RPG | Web-based Deep Mining Action & Exploration',
  description: 'Explore the endless abyss in Drilling RPG. A free-to-play web-based top-down mining action survival game. Gather minerals, craft items, upgrade your drill, and defeat giant bosses.',
  keywords: ['drilling rpg', 'mining game', 'web game', 'browser game', 'survival rpg', 'incremental mining', 'free web game', '드릴게임', '광부 게임', '웹 게임'],
  authors: [{ name: 'Drilling RPG Dev' }],
  openGraph: {
    title: 'Drilling RPG - Deep Mining Action',
    description: 'Explore the endless abyss in Drilling RPG. A free-to-play web-based top-down mining game.',
    siteName: 'Drilling RPG',
    images: [
      {
        url: '/icon.png',
        width: 512,
        height: 512,
        alt: 'Drilling RPG Icon',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Drilling RPG | Mining Exploration',
    description: 'Explore the endless abyss. Play the ultimate free web-based mining RPG!',
    images: ['/icon.png'],
  },
  icons: {
    icon: '/icon.png',
  },
  other: {
    'google-adsense-account': 'ca-pub-8319588891960553',
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
    <html lang="en">
      <head>
        <Script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8319588891960553" 
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-zinc-100 min-h-screen`}
      >
        <div id="drilling-game-root">
          {children}
        </div>
      </body>
    </html>
  );
}
