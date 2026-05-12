import { FastifyRequest } from "fastify";
import { GeocodingService } from "./geocoding.service";
import { SearchQuery, ReverseQuery } from "./geocoding.types";

interface SearchRequestQuery {
  text: string;
  countryCode?: string;
  limit?: number;
  lang?: string;
}

interface ReverseRequestQuery {
  lat: string;
  lon: string;
  lang?: string;
}

export const GeocodingController = {
  async search(
    request: FastifyRequest<{ Querystring: SearchRequestQuery }>
  ) {
    const { text, countryCode, limit, lang } = request.query;

    const query: SearchQuery = {
      text,
      countryCode,
      limit: Math.min(limit || 10, 20),
      lang: lang || "el",
    };

    const results = await GeocodingService.search(query);

    return { results };
  },

  async reverse(
    request: FastifyRequest<{ Querystring: ReverseRequestQuery }>
  ) {
    const { lat, lon, lang } = request.query;

    const query: ReverseQuery = {
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      lang: lang || "el",
    };

    if (isNaN(query.lat) || isNaN(query.lon)) {
      return { result: null };
    }

    const result = await GeocodingService.reverseGeocode(query);

    return { result };
  },
};
