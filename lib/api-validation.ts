import { z } from "zod";
import { CourseFiltersSchema as DiscoveryCourseFiltersSchema } from "./course-discovery";

export type { CourseApiFilters as CourseFilters } from "./course-discovery";

export const CourseFiltersSchema = DiscoveryCourseFiltersSchema;

/**
 * Validation schemas for API routes using Zod strict mode
 * Strict mode prevents prototype pollution and parameter injection attacks
 */

// UUID validation for IDs
export const UUIDSchema = z.string().uuid({
  message: "Invalid ID format - must be a valid UUID",
});

// Course schema for profile validation
const CourseSchema = z.object({
  id: z.string(),
  name: z.string(),
  credits: z.number(),
  level: z.enum(["grundnivå", "avancerad nivå"]),
  term: z.array(z.string()),
  period: z.array(z.string()),
  block: z.array(z.string()),
  pace: z.enum(["100%", "50%"]),
  examination: z.array(z.enum(["TEN", "LAB", "PROJ", "SEM", "UPG"])),
  campus: z.enum(["Linköping", "Norrköping", "Distans"]),
  programs: z.array(z.string()),
  orientations: z.array(z.string()),
  huvudomrade: z.string().nullable().optional(),
  examinator: z.string().nullable().optional(),
  studierektor: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

// Profile data validation (POST /api/profile)
export const ProfileDataSchema = z
  .object({
    id: z.string(),
    name: z.string().min(1).max(100),
    terms: z.record(z.enum(["7", "8", "9"]), z.array(CourseSchema)),
    metadata: z
      .object({
        total_credits: z.number(),
        advanced_credits: z.number(),
        is_valid: z.boolean(),
      })
      .optional(),
  })
  .strict(); // Reject unknown fields - prevents injection attacks

// Query parameter validation for profile endpoints
export const ProfileQuerySchema = z
  .object({
    id: UUIDSchema.optional(),
    userId: UUIDSchema.optional(),
  })
  .strict()
  .refine((data) => data.id || data.userId, {
    message: "Either 'id' or 'userId' must be provided",
  });

// Type exports for use in API routes
export type ProfileData = z.infer<typeof ProfileDataSchema>;
export type ProfileQuery = z.infer<typeof ProfileQuerySchema>;
