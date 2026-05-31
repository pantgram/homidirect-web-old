import { getApiError } from "@/api/client";

export function getApiErrorMessage(error: unknown): string {
  const apiError = getApiError(error);
  return apiError.message;
}

export function handleApiError(
  error: unknown,
  toast: (opts: { title: string; description?: string; variant?: string }) => void,
  fallbackTitle: string,
  fallbackDescription?: string,
): void {
  const message = getApiErrorMessage(error);
  toast({
    title: fallbackTitle,
    description: message || fallbackDescription,
    variant: "destructive",
  });
}
