import { Outfit } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import "aos/dist/aos.css";
import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Providers } from "@/components/providers";
import { SearchProvider } from "@/context/SearchContext";
import { AuthProvider } from "@/context/AuthContext";
import { LocaleProvider } from "@/context/LocaleContext";
import type { Metadata } from "next";
import SplashLoader from "@/components/loader/SplashLoader";
import GlobalLoader from "@/components/loader/GlobalLoader";
import AosProvider from "@/components/providers/AosProvider";
import NextTopLoader from "nextjs-toploader";
import QueryProvider from "@@/lib/query-provider";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DIVLAB Train | Formation en ligne, visioconference, mini-formations",
    template: "%s | DIVLAB Train",
  },
  description:
    "DIVLAB Train permet aux formateurs de creer, gerer et suivre leurs formations en ligne: participants, audience, revenus generes et paiements.",
  keywords: [
    "DIVLAB Train",
    "formation en ligne",
    "intelligence artificielle",
    "Design graphique",
    "creation de site web",
    "formation en visioconference",
    "mini-formations",
  ],
  metadataBase: new URL("https://train.divlabs-tech.com"),
  openGraph: {
    title: "DIVLAB Train",
    description:
      "Solution de formation en ligne par visioconference, avec suivi des participants, de l'audience, des revenus et des paiements.",
    url: "https://train.divlabs-tech.com",
    siteName: "DIVLAB Train",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "DIVLAB Train",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DIVLAB Train | Formation en ligne",
    description:
      "Creez, gerez et suivez vos formations en ligne avec DIVLAB Train.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @property --border-angle {
                syntax: "<angle>";
                inherits: true;
                initial-value: 0turn;
              }
            `,
          }}
        />
      </head>
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <NextTopLoader
          color="#2563eb"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #2563eb,0 0 5px #2563eb"
        />
        <QueryProvider>
          <Providers>
            <LocaleProvider>
              <AuthProvider>
                <SearchProvider>
                  <ThemeProvider>
                    <SidebarProvider>
                      <AosProvider>
                        <SplashLoader>
                          {children}
                          <Suspense fallback={null}>
                            <GlobalLoader />
                          </Suspense>
                        </SplashLoader>
                      </AosProvider>
                    </SidebarProvider>
                  </ThemeProvider>
                </SearchProvider>
              </AuthProvider>
            </LocaleProvider>
          </Providers>
        </QueryProvider>
      </body>
    </html>
  );
}
