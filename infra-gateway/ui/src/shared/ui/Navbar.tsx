"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Cpu, Box, LayoutDashboard, Terminal, FlaskConical, FolderTree } from "lucide-react";

export const Navbar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Overview", icon: LayoutDashboard },
    { href: "/explorer", label: "File Explorer", icon: FolderTree },
    { href: "/ocsp", label: "OCSP Engine", icon: ShieldCheck },
    { href: "/compiler", label: "Proxy Compiler", icon: Cpu },
    { href: "/sandbox", label: "Sandbox Manager", icon: Box },
    { href: "/docker-lab", label: "Docker Lab", icon: FlaskConical },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl w-full">
      <div className="w-full px-4 h-14 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 shrink-0">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20 border border-blue-400/30">
            <Terminal className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Infra Gateway
            </h1>
            <p className="text-[9px] font-mono text-slate-400 tracking-wider">
              EDGE PROXY & OCSP PLATFORM
            </p>
          </div>
        </div>

        <nav className="flex items-center flex-wrap gap-1 bg-slate-900/80 p-1 rounded-lg border border-white/10">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
