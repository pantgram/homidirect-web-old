export function formatPrice(price: number): string {
  return price.toLocaleString();
}

export function formatArea(area: number, unit = "m²"): string {
  return `${area.toLocaleString()} ${unit}`;
}

export function formatDate(
  date: string,
  locale: string = "en-US",
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Date(date).toLocaleDateString(locale, options);
}

export function formatDateTime(
  date: string,
  locale: string = "en-US",
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Date(date).toLocaleString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  });
}
