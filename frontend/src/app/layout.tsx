import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap', // 폰트 로딩 최적화
  preload: true,
});

export const metadata: Metadata = {
  title: 'AI-Streamer',
  description: '실시간 AI 음성 스트리밍 플랫폼',
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%238b5cf6'/%3E%3Cstop offset='100%25' style='stop-color:%23d946ef'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx='16' cy='16' r='15' fill='url(%23grad)'/%3E%3Crect x='13' y='8' width='6' height='10' rx='3' fill='white'/%3E%3Crect x='11' y='20' width='10' height='1' fill='white'/%3E%3Crect x='15' y='18' width='2' height='4' fill='white'/%3E%3Cpath d='M 8 12 Q 7 16 8 20' stroke='white' stroke-width='1.5' fill='none'/%3E%3Cpath d='M 24 12 Q 25 16 24 20' stroke='white' stroke-width='1.5' fill='none'/%3E%3C/svg%3E",
        type: 'image/svg+xml',
      },
    ],
    shortcut: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%238b5cf6'/%3E%3Cstop offset='100%25' style='stop-color:%23d946ef'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx='16' cy='16' r='15' fill='url(%23grad)'/%3E%3Crect x='13' y='8' width='6' height='10' rx='3' fill='white'/%3E%3Crect x='11' y='20' width='10' height='1' fill='white'/%3E%3Crect x='15' y='18' width='2' height='4' fill='white'/%3E%3Cpath d='M 8 12 Q 7 16 8 20' stroke='white' stroke-width='1.5' fill='none'/%3E%3Cpath d='M 24 12 Q 25 16 24 20' stroke='white' stroke-width='1.5' fill='none'/%3E%3C/svg%3E",
    apple: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%238b5cf6'/%3E%3Cstop offset='100%25' style='stop-color:%23d946ef'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx='16' cy='16' r='15' fill='url(%23grad)'/%3E%3Crect x='13' y='8' width='6' height='10' rx='3' fill='white'/%3E%3Crect x='11' y='20' width='10' height='1' fill='white'/%3E%3Crect x='15' y='18' width='2' height='4' fill='white'/%3E%3Cpath d='M 8 12 Q 7 16 8 20' stroke='white' stroke-width='1.5' fill='none'/%3E%3Cpath d='M 24 12 Q 25 16 24 20' stroke='white' stroke-width='1.5' fill='none'/%3E%3C/svg%3E",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
} 