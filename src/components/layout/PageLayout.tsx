import type { ReactNode } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

interface PageLayoutProps {
  children: ReactNode;
  showNav?: boolean;
  showFooter?: boolean;
}

export function PageLayout({ children, showNav = true, showFooter = true }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {showNav && <Navigation />}
      <main className="flex-1">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}
