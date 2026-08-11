import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "오늘의 9회 | 야구 성장 기록",
  description: "훈련과 마음을 함께 기록하는 아마야구 선수의 데일리 루틴 앱",
  openGraph: {
    title: "오늘의 9회",
    description: "훈련과 마음을 함께 기록하는 야구 성장 일지",
    images: [{ url: "/og.png", width: 1536, height: 1024, alt: "오늘의 9회 야구 성장 일지" }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "오늘의 9회", statusBarStyle: "black-translucent" },
  icons: { apple: "/icon-192.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
