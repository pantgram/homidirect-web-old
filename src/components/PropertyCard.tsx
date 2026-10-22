import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Heart,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/lib/toast";
import { favoritesApi } from "@/api/favorites";

interface PropertyCardProps {
  id?: number;
  image: string;
  title: string;
  location: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  propertyType: string;
  featured?: boolean;
  isFavorite?: boolean;
  onFavoriteChange?: (id: number, isFavorite: boolean) => void;
}

const PropertyCard = ({
  id,
  image,
  title,
  location,
  price,
  bedrooms,
  bathrooms,
  area,
  propertyType,
  featured = false,
  isFavorite: initialIsFavorite = false,
  onFavoriteChange,
}: PropertyCardProps) => {
  const { t } = useLanguage();

  const getPropertyTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      apartment: t("search.apartment"),
      house: t("search.house"),
      studio: t("search.studio"),
      room: t("search.room"),
    };
    return labels[type] || type;
  };
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    setIsFavorite(initialIsFavorite);
  }, [initialIsFavorite]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!id) return;

    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    setFavoriteLoading(true);
    try {
      const newFavoriteState = await favoritesApi.toggleFavorite(
        id,
        isFavorite
      );
      setIsFavorite(newFavoriteState);
      onFavoriteChange?.(id, newFavoriteState);
      toast({
        title: newFavoriteState ? t("favorites.added") : t("favorites.removed"),
      });
    } catch (err) {
      toast({
        title: t("favorites.removeFailed"),
        variant: "destructive",
      });
    } finally {
      setFavoriteLoading(false);
    }
  };

  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (id) {
      return (
        <Link to={`/listings/${id}`} className="block">
          {children}
        </Link>
      );
    }
    return <>{children}</>;
  };

  return (
    <CardWrapper>
      <Card className="group overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-elegant border-border">
        <div className="relative overflow-hidden aspect-[4/3]">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {featured && (
            <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground">
              {t("propertyCard.featured")}
            </Badge>
          )}
          <div className="absolute top-4 right-4 flex gap-2">
            <Badge className="bg-card text-card-foreground backdrop-blur-sm">
              {getPropertyTypeLabel(propertyType)}
            </Badge>
            {id && (
              <button
                onClick={handleToggleFavorite}
                disabled={favoriteLoading}
                className="bg-card/80 hover:bg-card rounded-full p-1.5 transition-colors disabled:opacity-50"
              >
                {favoriteLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Heart
                    className={`h-4 w-4 ${
                      isFavorite ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                )}
              </button>
            )}
          </div>
        </div>

        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-lg text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
                {title}
              </h3>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                {location}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary whitespace-nowrap">{price} €</div>
              <div className="text-xs text-muted-foreground">
                {t("propertyCard.perMonth")}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-border">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Bed className="h-4 w-4" />
              <span>{bedrooms} </span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Bath className="h-4 w-4" />
              <span>{bathrooms} </span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Square className="h-4 w-4" />
              <span>{area}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </CardWrapper>
  );
};

export default PropertyCard;
