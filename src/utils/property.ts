import type { PropertyType } from "@/types";
import type { TranslationKey } from "@/contexts/LanguageContext";

export function getPropertyTypeLabel(
  type: PropertyType,
  t: (key: TranslationKey) => string,
): string {
  const labels: Record<PropertyType, TranslationKey> = {
    apartment: "search.apartment",
    house: "search.house",
    studio: "search.studio",
    room: "search.room",
  };
  return t(labels[type]) || type;
}
