import { z } from 'zod';

// User schema for authentication
export const insertUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export const loginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required")
});

// Settings schema
export const insertSettingSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
  description: z.string().optional()
});

// Activity log schema
export const insertActivityLogSchema = z.object({
  userId: z.number(),
  action: z.string().min(1),
  details: z.string().optional(),
  timestamp: z.date().optional()
});

// Data source schema
export const insertSourceSchema = z.object({
  name: z.string().min(1, "Source name is required"),
  type: z.string().min(1, "Source type is required"),
  url: z.string().url("Valid URL is required").optional(),
  apiKey: z.string().optional(),
  configuration: z.object({}).optional(),
  isActive: z.boolean().default(true)
});

// Report schema
export const insertReportSchema = z.object({
  title: z.string().min(1, "Report title is required"),
  description: z.string().optional(),
  sourceIds: z.array(z.number()),
  filters: z.object({}).optional(),
  chartType: z.string().default("bar"),
  isPublic: z.boolean().default(false),
  createdBy: z.number()
});

// Report collaborator schema
export const insertReportCollaboratorSchema = z.object({
  reportId: z.number(),
  userId: z.number(),
  role: z.enum(["viewer", "editor", "admin"]).default("viewer")
});