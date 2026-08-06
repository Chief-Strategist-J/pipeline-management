import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/shared/ui/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Infrastructure Gateway & OCSP Control Center",
  description: "Enterprise Reverse Proxy Management, OCSP Stapling Engine, and Dynamic Sandbox Provisioner",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-blue-500/30 selection:text-blue-200`}>
        <Providers>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto p-6">{children}</main>
          <footer className="border-t border-white/5 py-6 text-center text-xs text-slate-500 font-mono">
            Infrastructure Gateway Platform &bull; OCSP Stapling Engine (Feature #16)
          </footer>
        </Providers>
      </body>
    </html>
  );
}
