import { z } from "zod";

/**
 * Listing ID parameter schema
 */
export const listingIdParamSchema = z.object({
  listingId: z.string().regex(/^\d+$/, "Listing ID must be a valid number"),
});

/**
 * Create listing schema
 */
export const createListingSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must not exceed 100 characters"),
  description: z.string().optional(),
  price: z.number().positive("Price must be a positive number"),
  city: z
    .string()
    .min(1, "City is required")
    .max(100, "City must not exceed 100 characters"),
  postalCode: z
    .string()
    .min(1, "Postal code is required")
    .max(20, "Postal code must not exceed 20 characters")
    .optional(),
  floor: z
    .enum(["basement", "semi-basement", "ground", "1st", "2nd", "3rd", "4th", "5th", "6th+"])
    .optional(),
  levels: z.number().int().min(0, "Levels must be 0 or greater").optional(),
  kitchens: z.number().int().min(0, "Kitchens must be 0 or greater").optional(),
  bedrooms: z.number().int().min(0, "Bedrooms must be 0 or greater").optional(),
  bathrooms: z
    .number()
    .int()
    .min(0, "Bathrooms must be 0 or greater")
    .optional(),
  area: z.number().positive("Area must be a positive number").optional(),
  dateAvailable: z.coerce.date().optional(),
  dateBuilt: z.number().int().min(1800, "Year built must be 1800 or later").optional(),
  country: z
    .string()
    .min(1, "Country is required")
    .max(100, "Country must not exceed 100 characters")
    .optional(),
  propertyType: z.enum(["apartment", "house", "studio", "room"], {
    errorMap: () => ({
      message: "Property type must be one of: apartment, house, studio, room",
    }),
  }),
  available: z.boolean().optional(),
  landlordId: z.number().int().positive().optional(),
  uploadSessionId: z.string().uuid().optional(),
  titleEl: z.string().max(100, "Greek title must not exceed 100 characters").optional(),
  titleEn: z.string().max(100, "English title must not exceed 100 characters").optional(),
  descriptionEl: z.string().optional(),
  descriptionEn: z.string().optional(),
});

/**
 * Update listing schema
 */
export const updateListingSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must not exceed 100 characters")
    .optional(),
  description: z.string().optional(),
  price: z.number().positive("Price must be a positive number").optional(),
  city: z
    .string()
    .min(1, "City is required")
    .max(100, "City must not exceed 100 characters")
    .optional(),
  postalCode: z
    .string()
    .min(1, "Postal code is required")
    .max(20, "Postal code must not exceed 20 characters")
    .optional(),
  floor: z
    .enum(["basement", "semi-basement", "ground", "1st", "2nd", "3rd", "4th", "5th", "6th+"])
    .optional(),
  levels: z.number().int().min(0, "Levels must be 0 or greater").optional(),
  kitchens: z.number().int().min(0, "Kitchens must be 0 or greater").optional(),
  bedrooms: z.number().int().min(0, "Bedrooms must be 0 or greater").optional(),
  bathrooms: z
    .number()
    .int()
    .min(0, "Bathrooms must be 0 or greater")
    .optional(),
  area: z.number().positive("Area must be a positive number").optional(),
  dateAvailable: z.coerce.date().optional(),
  dateBuilt: z.number().int().min(1800, "Year built must be 1800 or later").optional(),
  country: z
    .string()
    .min(1, "Country is required")
    .max(100, "Country must not exceed 100 characters")
    .optional(),
  propertyType: z
    .enum(["apartment", "house", "studio", "room"], {
      errorMap: () => ({
        message: "Property type must be one of: apartment, house, studio, room",
      }),
    })
    .optional(),
  available: z.boolean().optional(),
  titleEl: z.string().max(100, "Greek title must not exceed 100 characters").optional(),
  titleEn: z.string().max(100, "English title must not exceed 100 characters").optional(),
  descriptionEl: z.string().optional(),
  descriptionEn: z.string().optional(),
});

/**
 * Search listings query schema
 */
export const searchListingsSchema = z.object({
  q: z.string().max(200).optional(),
  propertyType: z.enum(["apartment", "house", "studio", "room"]).optional(),
  city: z.string().max(100).optional(),
  region: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  floor: z.enum(["basement", "semi-basement", "ground", "1st", "2nd", "3rd", "4th", "5th", "6th+"]).optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  minBedrooms: z.coerce.number().int().min(0).optional(),
  maxBedrooms: z.coerce.number().int().min(0).optional(),
  minBathrooms: z.coerce.number().int().min(0).optional(),
  maxBathrooms: z.coerce.number().int().min(0).optional(),
  minArea: z.coerce.number().positive().optional(),
  maxArea: z.coerce.number().positive().optional(),
  minKitchens: z.coerce.number().int().min(0).optional(),
  maxKitchens: z.coerce.number().int().min(0).optional(),
  minLevels: z.coerce.number().int().min(0).optional(),
  maxLevels: z.coerce.number().int().min(0).optional(),
  dateAvailableFrom: z.coerce.date().optional(),
  dateAvailableTo: z.coerce.date().optional(),
  minDateBuilt: z.coerce.number().int().min(1800).optional(),
  maxDateBuilt: z.coerce.number().int().optional(),
  available: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  verificationStatus: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  sortBy: z
    .enum([
      "featured",
      "newest",
      "oldest",
      "price_asc",
      "price_desc",
      "area_asc",
      "area_desc",
    ])
    .default("featured"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(15),
});

/**
 * Contact owner schema
 */
export const contactOwnerSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must not exceed 100 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().max(20, "Phone must not exceed 20 characters").optional(),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must not exceed 2000 characters"),
});

export type ListingIdParam = z.infer<typeof listingIdParamSchema>;
export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type SearchListingsQuery = z.infer<typeof searchListingsSchema>;
export type ContactOwnerInput = z.infer<typeof contactOwnerSchema>;
