import * as React from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useLocationSearch, useCountrySearch } from "@/hooks/useLocationSearch";
import type { LocationResult } from "@/api/geocoding";

interface LocationSearchProps {
  value: string;
  onValueChange: (value: string) => void;
  onLocationSelect?: (location: LocationResult) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  countryCode?: string;
  lang?: "en" | "el";
}

export function LocationSearch({
  value,
  onValueChange,
  onLocationSelect,
  placeholder = "Search address...",
  searchPlaceholder = "Search address...",
  emptyMessage = "No locations found.",
  disabled = false,
  error = false,
  className,
  countryCode,
  lang = "el",
}: LocationSearchProps) {
  const [open, setOpen] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { setQuery, results, isLoading } = useLocationSearch({
    countryCode,
    lang,
    debounceMs: 300,
    minChars: 3,
  });

  React.useEffect(() => {
    setQuery(value);
  }, [value, setQuery]);

  const handleSelect = (location: LocationResult) => {
    onValueChange(location.formatted);
    onLocationSelect?.(location);
    setOpen(false);
    setFocused(false);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (containerRef.current?.contains(e.relatedTarget as Node)) {
      return;
    }
    setFocused(false);
  };

  const showDropdown = focused && !disabled;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Input
        type="text"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        onFocus={() => {
          setFocused(true);
          setOpen(true);
        }}
        onBlur={handleBlur}
        placeholder={placeholder || searchPlaceholder}
        disabled={disabled}
        aria-expanded={open}
        aria-autocomplete="list"
        autoComplete="off"
        className={cn("w-full font-normal", error && "border-destructive")}
      />

      {showDropdown && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">
                {lang === "el" ? "Αναζήτηση..." : "Searching..."}
              </span>
            </div>
          ) : results.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {value.trim().length < 3
                ? lang === "el"
                  ? "Πληκτρολογήστε τουλάχιστον 3 χαρακτήρες για αναζήτηση..."
                  : "Type at least 3 characters to search..."
                : emptyMessage}
            </div>
          ) : (
            <div className="max-h-60 overflow-auto p-1">
              {results.map((location) => (
                <div
                  key={location.placeId}
                  role="option"
                  aria-selected={value === location.formatted}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(location);
                  }}
                  className={cn(
                    "relative flex w-full cursor-pointer select-none items-start rounded-sm py-3 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <Check
                    className={cn(
                      "absolute left-2 top-3 h-4 w-4 shrink-0",
                      value === location.formatted
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  <span className="truncate font-medium">
                    {location.formatted}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface CountrySearchProps {
  value: string;
  onValueChange: (value: string, code?: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  lang?: "en" | "el";
}

export function CountrySearch({
  value,
  onValueChange,
  placeholder = "Select country...",
  searchPlaceholder = "Search countries...",
  emptyMessage = "No countries found.",
  disabled = false,
  error = false,
  className,
  lang = "en",
}: CountrySearchProps) {
  const [open, setOpen] = React.useState(false);
  const { query, setQuery, countries, getCountryCode } = useCountrySearch(lang);

  const handleSelect = (countryName: string) => {
    const code = getCountryCode(countryName);
    onValueChange(countryName, code);
    setOpen(false);
    setQuery("");
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setQuery("");
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal h-10",
            !value && "text-muted-foreground",
            error && "border-destructive",
            className,
          )}
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {countries.length === 0 ? (
              <CommandEmpty>{emptyMessage}</CommandEmpty>
            ) : (
              <CommandGroup>
                {countries.map((country) => (
                  <CommandItem
                    key={country.code}
                    value={country.code}
                    onSelect={() => handleSelect(country.name)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === country.name ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {country.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
