import type { Metadata } from "next";
import "./globals.css";
import ConditionalHeader from "@/components/ConditionalHeader";

export const metadata: Metadata = {
  title: {
    default: "Portal Quiosques de Praia | Os melhores quiosques de praia do Brasil",
    template: "%s | Quiosques de Praia",
  },
  description:
    "Encontre os melhores quiosques de praia do Brasil. Bebidas, petiscos, música e mais à beira-mar.",
  keywords: [
    "quiosque de praia",
    "quiosque",
    "praia",
    "Brasil",
    "bar de praia",
    "restaurante praia",
  ],
  openGraph: {
    title: "Portal Quiosques de Praia",
    description: "Encontre os melhores quiosques de praia do Brasil",
    url: "https://portalquiosques.vercel.app",
    siteName: "Quiosques de Praia",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <ConditionalHeader />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
