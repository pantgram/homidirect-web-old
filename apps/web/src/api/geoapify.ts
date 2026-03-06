import { apiClient } from "./client";

export interface LocationResult {
  placeId: string;
  formatted: string;
  city: string;
  country: string;
  suburb?: string;
  neighbourhood?: string;
  quarter?: string;
  postalCode?: string;
  resultType: string;
  lat: number;
  lon: number;
}

export async function searchLocations(
  query: string,
  options?: {
    countryCode?: string;
    limit?: number;
    lang?: string;
  }
): Promise<LocationResult[]> {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    const params = new URLSearchParams({
      text: query,
      limit: String(options?.limit || 10),
      lang: options?.lang || "el",
    });

    if (options?.countryCode) {
      params.append("countryCode", options.countryCode);
    }

    const response = await apiClient.get<{ results: LocationResult[] }>(
      `/geoapify/search?${params}`
    );

    return response.data.results || [];
  } catch (error) {
    console.error("Error fetching locations:", error);
    return [];
  }
}

export async function searchCities(
  query: string,
  countryCode?: string
): Promise<LocationResult[]> {
  return searchLocations(query, {
    countryCode,
    limit: 10,
  });
}

export async function searchGreekLocations(
  query: string
): Promise<LocationResult[]> {
  return searchLocations(query, {
    countryCode: "gr",
    limit: 10,
    lang: "el",
  });
}

const COUNTRIES = [
  { code: "GR", name: "Greece", nameEl: "Ελλάδα" },
  { code: "CY", name: "Cyprus", nameEl: "Κύπρος" },
  { code: "AL", name: "Albania", nameEl: "Αλβανία" },
  { code: "BG", name: "Bulgaria", nameEl: "Βουλγαρία" },
  { code: "TR", name: "Turkey", nameEl: "Τουρκία" },
  { code: "IT", name: "Italy", nameEl: "Ιταλία" },
  { code: "DE", name: "Germany", nameEl: "Γερμανία" },
  { code: "FR", name: "France", nameEl: "Γαλλία" },
  { code: "GB", name: "United Kingdom", nameEl: "Ηνωμένο Βασίλειο" },
  { code: "ES", name: "Spain", nameEl: "Ισπανία" },
  { code: "PT", name: "Portugal", nameEl: "Πορτογαλία" },
  { code: "NL", name: "Netherlands", nameEl: "Ολλανδία" },
  { code: "BE", name: "Belgium", nameEl: "Βέλγιο" },
  { code: "AT", name: "Austria", nameEl: "Αυστρία" },
  { code: "CH", name: "Switzerland", nameEl: "Ελβετία" },
  { code: "SE", name: "Sweden", nameEl: "Σουηδία" },
  { code: "NO", name: "Norway", nameEl: "Νορβηγία" },
  { code: "DK", name: "Denmark", nameEl: "Δανία" },
  { code: "FI", name: "Finland", nameEl: "Φινλανδία" },
  { code: "PL", name: "Poland", nameEl: "Πολωνία" },
  { code: "CZ", name: "Czech Republic", nameEl: "Τσεχία" },
  { code: "HU", name: "Hungary", nameEl: "Ουγγαρία" },
  { code: "RO", name: "Romania", nameEl: "Ρουμανία" },
  { code: "HR", name: "Croatia", nameEl: "Κροατία" },
  { code: "RS", name: "Serbia", nameEl: "Σερβία" },
  { code: "MK", name: "North Macedonia", nameEl: "Βόρεια Μακεδονία" },
  { code: "ME", name: "Montenegro", nameEl: "Μαυροβούνιο" },
  { code: "SI", name: "Slovenia", nameEl: "Σλοβενία" },
  { code: "SK", name: "Slovakia", nameEl: "Σλοβακία" },
  { code: "UA", name: "Ukraine", nameEl: "Ουκρανία" },
  { code: "RU", name: "Russia", nameEl: "Ρωσία" },
  { code: "US", name: "United States", nameEl: "Ηνωμένες Πολιτείες" },
  { code: "CA", name: "Canada", nameEl: "Καναδάς" },
  { code: "AU", name: "Australia", nameEl: "Αυστραλία" },
  { code: "AE", name: "United Arab Emirates", nameEl: "Ηνωμένα Αραβικά Εμιράτα" },
];

export function getCountries(lang: "en" | "el" = "en") {
  return COUNTRIES.map((c) => ({
    code: c.code,
    name: lang === "el" ? c.nameEl : c.name,
  }));
}

export function getCountryCode(countryName: string): string | undefined {
  const country = COUNTRIES.find(
    (c) =>
      c.name.toLowerCase() === countryName.toLowerCase() ||
      c.nameEl.toLowerCase() === countryName.toLowerCase()
  );
  return country?.code.toLowerCase();
}
