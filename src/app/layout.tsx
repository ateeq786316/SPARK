import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SPARK — Find Scholarships, Jobs & Opportunities",
    template: "%s · SPARK",
  },
  description:
    "Discover verified global scholarships, jobs, internships, fellowships and more in one place.",
  metadataBase: new URL("https://spark.example.com"),
  openGraph: {
    title: "SPARK — Find Scholarships, Jobs & Opportunities",
    description:
      "Discover verified global scholarships, jobs, internships, fellowships and more in one place.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background font-sans text-foreground antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
