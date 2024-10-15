import { ApolloWrapper } from "../components/ApolloWrapper";
import { Analytics } from "@vercel/analytics/react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./styles/global.css";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export const metadata = {
  title: "Part 107 Drone License Quiz App",
  description:
    "Prepare for your FAA certification with our comprehensive quiz app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (GA_MEASUREMENT_ID) {
      const url =
        pathname + (searchParams.toString() ? "?" + searchParams.toString() : "");
      window.gtag("config", GA_MEASUREMENT_ID, {
        page_path: url,
      });
    }
  }, [GA_MEASUREMENT_ID, pathname, searchParams]);

  return (
    <html lang="en">
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
          `}
        </Script>
      </head>
      <body className="flex flex-col min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100">
        <ApolloWrapper>
          <Navbar />
          <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-7xl">
            {children}
            <Analytics />
          </main>
          <Footer />
        </ApolloWrapper>
      </body>
    </html>
  );
}
