import type { PropertyType } from "@/types";
import type { TranslationKey } from "@/contexts/LanguageContext";

export function getPropertyTypeLabel(
  type: string,
  t: (key: TranslationKey) => string,
): string {
  // The API types propertyType as a plain string; fall back to the raw
  // value when it is not one of the known types.
  const labels: Record<PropertyType, TranslationKey> = {
    apartment: "search.apartment",
    house: "search.house",
    studio: "search.studio",
    room: "search.room",
  };
  const key = labels[type as PropertyType];
  return key ? t(key) : type;
}
