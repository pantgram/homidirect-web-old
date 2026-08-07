import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "react-router-dom";
import LanguageSelector from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { UserMenuDropdown } from "@/components/layout/UserMenuDropdown";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="" className="h-16 w-auto" />
            <div className="flex items-center text-4xl font-sans tracking-tight text-slate-500">
              <span className="font-extrabold">Homi</span>
              <span className="font-light">Direct</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/search"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              {t("nav.browse")}
            </Link>
            <Link
              to="/list-property-info"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              {t("nav.list")}
            </Link>
            <Link
              to="/how-it-works"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              {t("nav.howItWorks")}
            </Link>
            <LanguageSelector />
            {isLoading ? (
              <div className="h-8 w-8 animate-pulse bg-muted rounded-full" />
            ) : isAuthenticated ? (
              <UserMenuDropdown />
            ) : (
              <Link to="/auth">
                <Button variant="hero">{t("nav.signIn")}</Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6 text-foreground" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-3">
            <Link
              to="/search"
              className="block text-sm font-medium text-foreground hover:text-primary transition-colors py-2"
            >
              {t("nav.browse")}
            </Link>
            <Link
              to="/list-property-info"
              className="block text-sm font-medium text-foreground hover:text-primary transition-colors py-2"
            >
              {t("nav.list")}
            </Link>
            <Link
              to="/how-it-works"
              className="block text-sm font-medium text-foreground hover:text-primary transition-colors py-2"
            >
              {t("nav.howItWorks")}
            </Link>
            <div className="flex items-center gap-2 py-2">
              <LanguageSelector />
            </div>
            <div className="flex flex-col gap-2 pt-2">
              {isLoading ? (
                <div className="h-10 w-full animate-pulse bg-muted rounded" />
              ) : isAuthenticated ? (
                <UserMenuDropdown />
              ) : (
                <Link to="/auth">
                  <Button variant="hero" className="w-full">
                    {t("nav.signIn")}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
