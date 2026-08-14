import { z } from "zod";

export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email address");

// Mirrors the backend password policy (src/api auth schema `_validate_password`).
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one digit");

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: emailSchema,
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

/**
 * Shared validation for listing form fields. Numeric inputs are kept as strings
 * (matching the form inputs) and coerced on submit. Reused by the create/edit
 * listing forms.
 */
export const listingFormSchema = z.object({
  titleEl: z.string().min(1),
  descriptionEl: z.string(),
  propertyType: z.enum(["apartment", "house", "studio", "room"]),
  price: z.string().refine((v) => parseFloat(v) > 0, "Invalid price"),
  address: z.string().min(1),
  city: z.string().min(1),
  postalCode: z.string(),
  country: z.string(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  bedrooms: z.string().refine((v) => Number.isInteger(+v) && +v >= 0, "Invalid"),
  bathrooms: z.string().refine((v) => Number.isInteger(+v) && +v >= 0, "Invalid"),
  area: z.string().refine((v) => parseFloat(v) > 0, "Invalid area"),
});

export type ListingFormValues = z.infer<typeof listingFormSchema>;
