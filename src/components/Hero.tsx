import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import heroImage from "@/assets/hero-bg.jpg";
import { useLanguage } from "@/contexts/LanguageContext";
import { listingsApi, PlatformStats } from "@/api/listings";

const Hero = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState<PlatformStats>({
    activeListingsCount: 0,
    propertyOwnersCount: 0,
  });

  useEffect(() => {
    listingsApi.getStats().then(setStats).catch(() => {});
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    }
    navigate(`/search${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const handleQuickFilter = (propertyType: string) => {
    const params = new URLSearchParams();
    params.set("type", propertyType);
    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    }
    navigate(`/search?${params.toString()}`);
  };

  return (
    <section className="relative min-h-[600px] flex items-center">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            {t("hero.perfectHome")}
            <span className="text-primary block mt-2">
              {t("hero.withoutHassle")}
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {t("hero.connectDirectly")}
          </p>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="bg-card rounded-xl shadow-elegant p-6 backdrop-blur-sm"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                type="text"
                placeholder={t("hero.searchPlaceholder")}
                className="flex-1 h-12 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" variant="hero" size="lg" className="h-12">
                <Search className="mr-2 h-5 w-5" />
                {t("hero.search")}
              </Button>
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              <button
                type="button"
                onClick={() => handleQuickFilter("apartment")}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {t("hero.apartments")}
              </button>
              <span className="text-muted-foreground">•</span>
              <button
                type="button"
                onClick={() => handleQuickFilter("house")}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {t("hero.houses")}
              </button>
              <span className="text-muted-foreground">•</span>
              <button
                type="button"
                onClick={() => handleQuickFilter("studio")}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {t("hero.studios")}
              </button>
              <span className="text-muted-foreground">•</span>
              <button
                type="button"
                onClick={() => handleQuickFilter("room")}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {t("hero.room")}
              </button>
            </div>
          </form>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-10">
            <div>
              <div className="text-3xl font-bold text-foreground">
                {stats.activeListingsCount.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                {t("hero.activeListings")}
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground">
                {stats.propertyOwnersCount.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                {t("hero.propertyOwners")}
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground">0%</div>
              <div className="text-sm text-muted-foreground">
                {t("hero.agentFees")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
