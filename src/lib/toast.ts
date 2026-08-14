import type { ReactNode } from "react";
import { toast as sonnerToast } from "sonner";

type ToastVariant = "default" | "destructive" | "success";

interface ToastOptions {
  title?: ReactNode;
  description?: ReactNode;
  variant?: ToastVariant;
}

/**
 * Thin adapter over `sonner` that preserves the legacy
 * `toast({ title, description, variant })` call shape used across the app,
 * so the duplicate Radix toast state machine could be removed.
 */
export function toast({ title, description, variant = "default" }: ToastOptions) {
  const message = title ?? "";
  const opts = description !== undefined ? { description } : undefined;

  switch (variant) {
    case "destructive":
      return sonnerToast.error(message, opts);
    case "success":
      return sonnerToast.success(message, opts);
    default:
      return sonnerToast(message, opts);
  }
}
