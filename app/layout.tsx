import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "RuangPulih",
    template: "%s | RuangPulih",
  },
  description:
    "Sistem skrining awal kesehatan mental berbasis aturan pakar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}