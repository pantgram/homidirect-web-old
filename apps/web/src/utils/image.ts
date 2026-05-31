import { env } from "@/config/env";

export function getImageUrl(url: string): string {
  if (url.startsWith("http")) return url;
  return `${env.apiUrl}${url}`;
}
