import { FastifyRequest } from "fastify";
import { GeoapifyService } from "./geoapify.service";
import { SearchQuery } from "./geoapify.types";

interface SearchRequestQuery {
  text: string;
  countryCode?: string;
  limit?: number;
  lang?: string;
}

export const GeoapifyController = {
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

    const results = await GeoapifyService.search(query);

    return { results };
  },
};
