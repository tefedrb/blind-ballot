import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import { ThemeProvider } from "next-themes";
import { Suspense } from "react";
import { AuthButton } from "@/components/auth-button";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Blind Ballot",
  description:
    "Twelve promises to voters, with the party labels removed. Say whether you'd support each one, and guess who proposed it.",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <header className="border-b">
            <nav className="mx-auto flex h-14 max-w-md items-center justify-between gap-4 px-4 text-sm">
              <Link href="/" className="font-semibold">
                Blind Ballot
              </Link>
              <div className="flex min-w-0 items-center gap-4">
                <Link href="/how-it-works" className="shrink-0">
                  How it works
                </Link>
                {/* It reads the session, so it streams in after the static shell. */}
                <Suspense>
                  <AuthButton />
                </Suspense>
              </div>
            </nav>
          </header>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
