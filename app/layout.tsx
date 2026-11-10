import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ThinkLingua — think it, don't translate it",
  description:
    "Learn Thai, Japanese, Spanish, French and Russian the way you learned your first language: picture, sound, meaning. Native-accent neural voices, an AI conversation partner, and a monolingual streak that keeps you out of English.",
  applicationName: "ThinkLingua",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          precedence="default"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@500;600;700;800&family=Noto+Sans+JP:wght@400;500;700&family=Noto+Sans+Thai:wght@400;500;600;700&family=Noto+Sans:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
