export interface PhotonFeatureProperties {
  name?: string;
  street?: string;
  housenumber?: string;
  postcode?: string;
  city?: string;
  country?: string;
  countrycode?: string;
  state?: string;
  county?: string;
  type?: string;
  osm_key?: string;
  osm_value?: string;
  osm_type?: string;
  osm_id?: number;
}

export interface PhotonFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: PhotonFeatureProperties;
}

export interface PhotonResponse {
  type: "FeatureCollection";
  features: PhotonFeature[];
}

export interface NominatimReverseResponse {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    house_number?: string;
    road?: string;
    suburb?: string;
    neighbourhood?: string;
    quarter?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
  };
}

export interface LocationResult {
  placeId: string;
  formatted: string;
  address: string;
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

export interface ReverseGeocodeResult {
  address: string;
  city: string;
  country: string;
  postalCode?: string;
  lat: number;
  lon: number;
}

export interface SearchQuery {
  text: string;
  countryCode?: string;
  limit?: number;
  lang?: string;
}

export interface ReverseQuery {
  lat: number;
  lon: number;
  lang?: string;
}
