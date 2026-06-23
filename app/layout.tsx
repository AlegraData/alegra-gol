import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "⚽ Penaltis por la Seguridad | Alegra",
  description: "Juego interactivo de penaltis para reforzar la cultura de seguridad en Alegra. Aprende sobre datos sensibles, tokens expuestos y buenas prácticas mientras disfrutas del mundial.",
  openGraph: {
    title: "⚽ Penaltis por la Seguridad | Alegra",
    description: "Aprende sobre seguridad de la información mientras cobras penaltis. ¡Colombia vs República del Congo!",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
