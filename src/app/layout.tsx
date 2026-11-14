import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { AccountNavigation } from "@/components/layout/account-navigation";
import "./globals.css";
export const metadata: Metadata = { title: { default: "Club Compass", template: "%s | Club Compass" }, description: "Discover, understand and plan your school activities." };
export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header className="site-header shell"><Link className="brand" href="/"><span className="brand-mark" aria-hidden="true">C</span>Club Compass</Link><AccountNavigation /></header>
    {children}
    <footer className="shell site-footer"><span>Club Compass</span><p>A place for every interest. A plan that fits your life.</p></footer>
  </body></html>;
}
