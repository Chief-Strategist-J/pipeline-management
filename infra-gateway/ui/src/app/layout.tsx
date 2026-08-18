import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/shared/ui/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "OpenVSCode Explorer & Pipeline Management Control Center",
  description: "Enterprise OpenVSCode File Tree Explorer, Rules Engine Policy Validator, and Sandbox Provisioner",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className={`${inter.className} bg-[#090d16] text-slate-100 min-h-screen flex flex-col antialiased selection:bg-blue-500/30 selection:text-blue-200 overflow-x-hidden`}>
        <Providers>
          <Navbar />
          <main className="flex-1 w-full p-0 m-0 overflow-hidden">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
