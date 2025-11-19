import { z } from "zod";

export const JobSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3),
  description: z.string().min(10),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  companyId: z.string(),
  location: z.string(),
  employmentType: z.enum(["full_time", "part_time", "contract", "internship"]),
  experienceLevel: z.enum(["entry", "mid", "senior", "lead"]),
  salaryRange: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      currency: z.string().default("INR")
    })
    .optional(),
  tags: z.array(z.string()).default([]),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  publishedAt: z.string().optional(),
  createdBy: z.string().optional()
});

export type Job = z.infer<typeof JobSchema>;

export const CompanySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  description: z.string().min(10),
  website: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
  industry: z.string().optional(),
  size: z.enum(["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"]).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export type Company = z.infer<typeof CompanySchema>;

export const PortalUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string().min(2),
  role: z.enum(["super_admin", "admin", "recruiter", "content_editor", "viewer"]),
  photoUrl: z.string().url().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().optional()
});

export type PortalUser = z.infer<typeof PortalUserSchema>;
