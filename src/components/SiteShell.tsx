"use client";

import { usePathname } from "next/navigation";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <>
      {!isAdmin && <Navigation />}
      <main className={!isAdmin ? "pb-16 lg:pb-0" : ""}>{children}</main>
      {!isAdmin && <Footer />}
      {!isAdmin && <FloatingButtons />}
    </>
  );
}
