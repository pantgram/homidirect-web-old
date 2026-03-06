export interface GeoapifyResult {
  place_id: string;
  formatted: string;
  city?: string;
  municipality?: string;
  county?: string;
  name?: string;
  country: string;
  suburb?: string;
  neighbourhood?: string;
  quarter?: string;
  postcode?: string;
  result_type: string;
  lat: number;
  lon: number;
  rank?: {
    importance: number;
    popularity: number;
    confidence: number;
    confidence_city_level: number;
    match_type: string;
  };
}

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

export interface SearchQuery {
  text: string;
  countryCode?: string;
  limit?: number;
  lang?: string;
}

export interface GeoapifyAutocompleteResponse {
  results: GeoapifyResult[];
}
