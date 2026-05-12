import { useState, useEffect, useCallback, useRef } from "react";
import {
  searchLocations,
  getCountries,
  getCountryCode,
  type LocationResult,
} from "@/api/geocoding";

interface UseLocationSearchOptions {
  countryCode?: string;
  debounceMs?: number;
  minChars?: number;
  lang?: "en" | "el";
}

export function useLocationSearch(options: UseLocationSearchOptions = {}) {
  const { countryCode, debounceMs = 300, minChars = 2, lang = "el" } = options;

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const search = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.length < minChars) {
        setResults([]);
        return;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setIsLoading(true);
      setError(null);

      try {
        const locationResults = await searchLocations(searchQuery, {
          countryCode,
          lang,
          limit: 10,
        });
        setResults(locationResults);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message);
          setResults([]);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [countryCode, lang, minChars]
  );

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (query.length < minChars) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    timeoutRef.current = setTimeout(() => {
      search(query);
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query, search, debounceMs, minChars]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const clear = useCallback(() => {
    setQuery("");
    setResults([]);
    setError(null);
  }, []);

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    clear,
  };
}

export function useCountrySearch(lang: "en" | "el" = "en") {
  const [query, setQuery] = useState("");
  const countries = getCountries(lang);

  const filteredCountries = query
    ? countries.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase())
      )
    : countries;

  return {
    query,
    setQuery,
    countries: filteredCountries,
    allCountries: countries,
    getCountryCode,
  };
}
