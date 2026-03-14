import type { Metadata } from "next";
import { Bebas_Neue, Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { LanguageProvider } from "@/contexts/LanguageContext";
import SiteShell from "@/components/SiteShell";
import { Analytics } from "@vercel/analytics/next";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://voyage-voyage-djibouti.com"),
  title: "VOYAGE VOYAGE - Agence Touristique Djibouti",
  description:
    "Découvrez Djibouti avec VOYAGE VOYAGE. Des paysages lunaires du Lac Abbé aux plages paradisiaques des Sables Blancs, vivez une aventure unique.",
  keywords:
    "Djibouti, tourisme, voyage, Lac Abbé, Lac Assal, Sables Blancs, requin-baleine, désert, mer rouge, aventure",
  openGraph: {
    title: "VOYAGE VOYAGE - Agence Touristique Djibouti",
    description:
      "Découvrez Djibouti avec VOYAGE VOYAGE. Des paysages lunaires du Lac Abbé aux plages paradisiaques des Sables Blancs, vivez une aventure unique.",
    images: [{ url: "/images/pics/logo/logovoyage.webp" }],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script defer src="https://cloud.umami.is/script.js" data-website-id="5dd6b684-f2db-463e-8240-a61f6a58475f"></script>
      </head>
      <body className={`${bebasNeue.variable} ${outfit.variable} antialiased`}>
        <LanguageProvider>
          <SiteShell>{children}</SiteShell>
          <Analytics />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#fff",
                color: "#333",
                border: "1px solid #e5e7eb",
                fontFamily: "var(--font-outfit)",
              },
            }}
          />
        </LanguageProvider>
      </body>
    </html>
  );
}
