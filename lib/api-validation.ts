import { z } from "zod";

/**
 * Validation schemas for API routes using Zod strict mode
 * Strict mode prevents prototype pollution and parameter injection attacks
 */

// UUID validation for IDs
export const UUIDSchema = z.string().uuid({
  message: "Invalid ID format - must be a valid UUID",
});

// Course filters validation (GET /api/courses)
export const CourseFiltersSchema = z
  .object({
    // Pagination
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(50),
    loadAll: z.coerce.boolean().default(false),

    // Filters (arrays)
    level: z.array(z.string()).default([]),
    term: z.array(z.string()).default([]),
    period: z.array(z.string()).default([]),
    block: z.array(z.string()).default([]),
    pace: z.array(z.string()).default([]),
    campus: z.array(z.string()).default([]),
    orientations: z.array(z.string()).default([]),

    // Single value filters
    programs: z.string().optional(),
    search: z.string().max(200).optional(),
  })
  .strict(); // Reject unknown fields

// Course schema for profile validation
const CourseSchema = z.object({
  id: z.string(),
  name: z.string(),
  credits: z.number(),
  level: z.enum(["grundnivå", "avancerad nivå"]),
  term: z.array(z.string()),
  period: z.array(z.string()),
  block: z.array(z.string()),
  pace: z.string(),
  examination: z.array(z.string()),
  campus: z.string(),
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
export type CourseFilters = z.infer<typeof CourseFiltersSchema>;
export type ProfileData = z.infer<typeof ProfileDataSchema>;
export type ProfileQuery = z.infer<typeof ProfileQuerySchema>;
