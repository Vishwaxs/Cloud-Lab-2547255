import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import { ThemeProvider } from "./components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Portfolio | Vishwas Vashishtha - Full Stack Developer",
    template: "%s | Vishwas Vashishtha - Full Stack Developer"
  },
  description: "Experienced Full Stack Developer specializing in React, Next.js, TypeScript, and modern web technologies. Building scalable applications with clean code and exceptional user experiences.",
  keywords: [
    "portfolio", "full stack developer", "react developer", "nextjs developer", 
    "typescript", "javascript", "web development", "frontend", "backend", 
    "node.js", "tailwind css", "responsive design", "web applications"
  ],
  authors: [{ name: "Vishwas Vashishtha", url: "https://yourportfolio.com" }],
  creator: "Vishwas Vashishtha",
  publisher: "Vishwas Vashishtha",
  category: "Technology",
  metadataBase: new URL('https://yourportfolio.com'),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "Portfolio | Vishwas Vashishtha - Full Stack Developer",
    description: "Experienced Full Stack Developer specializing in React, Next.js, TypeScript, and modern web technologies.",
    url: "https://yourportfolio.com",
    siteName: "Vishwas Vashishtha Portfolio",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Vishwas Vashishtha - Full Stack Developer Portfolio",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio | Vishwas Vashishtha - Full Stack Developer",
    description: "Experienced Full Stack Developer specializing in React, Next.js, TypeScript, and modern web technologies.",
    images: ["/og-image.jpg"],
    creator: "@vishwasvashishtha",
  },
  verification: {
    google: "your-google-site-verification",
    yandex: "your-yandex-verification",
    yahoo: "your-yahoo-site-verification",
  },
  alternates: {
    canonical: "https://yourportfolio.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning={true}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const shouldBeDark = theme === 'dark' || (!theme && systemPrefersDark);
                  
                  if (shouldBeDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.add('light');
                  }
                } catch (e) {
                  console.error('Theme initialization error:', e);
                }
              })();
            `,
          }}
        />
        <link 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
          rel="preload" 
          as="style"
          crossOrigin="anonymous"
        />
        <link 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
          rel="stylesheet" 
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#3b82f6" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased transition-colors duration-300`}
      >
        <ThemeProvider>
          <Navigation />
          <main>
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
