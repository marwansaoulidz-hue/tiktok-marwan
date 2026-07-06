import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Social Video App",
  description: "Application sociale auto-hébergée pour vidéos courtes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
