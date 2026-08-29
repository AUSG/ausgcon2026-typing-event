import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "TYPE INTO THE FUTURE — AUSGCON 2026",
  description: "AUSGCON 2026 타이핑 챌린지. 한 번의 도전으로 오늘의 최고 타수를 기록하세요.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

