import { z } from "zod";
import type { OpportunityType } from "@/types";

export const opportunityTypeSchema = z.enum([
  "scholarship",
  "job",
  "internship",
  "fellowship",
  "conference",
  "exchange_program",
  "competition",
  "grant",
  "professional_development",
]);

export const scholarshipFieldsSchema = z.object({
  university: z.string().min(1, "University is required"),
  degree: z.string().min(1, "Degree is required"),
  funding_type: z.string().min(1, "Funding type is required"),
  eligibility: z.string().min(1, "Eligibility is required"),
  cgpa: z.string().optional(),
  ielts_toefl: z.string().optional(),
  required_documents: z.array(z.string().min(1)).default([]),
  benefits: z.string().optional(),
});

export const jobFieldsSchema = z.object({
  organization: z.string().min(1, "Organization is required"),
  location: z.string().min(1, "Location is required"),
  experience: z.string().min(1, "Experience level is required"),
  salary: z.string().optional(),
});

export const internshipFieldsSchema = z.object({
  company: z.string().min(1, "Company is required"),
  duration: z.string().min(1, "Duration is required"),
  paid_unpaid: z.string().min(1, "Paid/unpaid is required"),
  skills: z.array(z.string().min(1)).default([]),
});

const hostFieldsSchema = z.object({
  host: z.string().min(1, "Host is required"),
  eligibility: z.string().min(1, "Eligibility is required"),
  benefits: z.string().optional(),
  dates: z.string().optional(),
});

export const fellowshipFieldsSchema = hostFieldsSchema;
export const conferenceFieldsSchema = hostFieldsSchema;
export const exchangeProgramFieldsSchema = hostFieldsSchema;

export const competitionFieldsSchema = z.object({
  organizer: z.string().min(1, "Organizer is required"),
  prizes: z.string().optional(),
});

export const grantFieldsSchema = z.object({
  grantor: z.string().min(1, "Grantor is required"),
  amount: z.string().optional(),
});

export const professionalDevelopmentFieldsSchema = z.object({
  provider: z.string().min(1, "Provider is required"),
  format_duration: z.string().min(1, "Format/duration is required"),
  fees: z.string().optional(),
});

export const fieldsByType: Record<OpportunityType, z.ZodType<unknown>> = {
  scholarship: scholarshipFieldsSchema,
  job: jobFieldsSchema,
  internship: internshipFieldsSchema,
  fellowship: fellowshipFieldsSchema,
  conference: conferenceFieldsSchema,
  exchange_program: exchangeProgramFieldsSchema,
  competition: competitionFieldsSchema,
  grant: grantFieldsSchema,
  professional_development: professionalDevelopmentFieldsSchema,
};

const baseFields = {
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens"),
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  summary: z.string().max(500).optional(),
  country: z.string().optional(),
  deadline: z.string().optional(),
  source_url: z.string().url("Must be a valid URL").optional(),
  featured_image: z.string().optional(),
  featured: z.boolean().default(false),
};

function opportunityVariant(
  type: OpportunityType,
  fieldsSchema: z.ZodType<unknown>
) {
  return z.object({
    ...baseFields,
    type: z.literal(type),
    fields: fieldsSchema,
  });
}

export const opportunitySchema = z.discriminatedUnion("type", [
  opportunityVariant("scholarship", scholarshipFieldsSchema),
  opportunityVariant("job", jobFieldsSchema),
  opportunityVariant("internship", internshipFieldsSchema),
  opportunityVariant("fellowship", fellowshipFieldsSchema),
  opportunityVariant("conference", conferenceFieldsSchema),
  opportunityVariant("exchange_program", exchangeProgramFieldsSchema),
  opportunityVariant("competition", competitionFieldsSchema),
  opportunityVariant("grant", grantFieldsSchema),
  opportunityVariant("professional_development", professionalDevelopmentFieldsSchema),
]);

export type OpportunityInput = z.infer<typeof opportunitySchema>;

/** Keys whose schema rejects `undefined` (i.e. required for this type). */
function requiredFieldKeys(schema: {
  shape: Record<string, z.ZodType>;
}): string[] {
  return Object.entries(schema.shape)
    .filter(([, value]) => !value.safeParse(undefined).success)
    .map(([key]) => key);
}

/** Missing required field labels for a type — powers the approval gate (G1). */
export function missingRequiredFields(
  type: OpportunityType,
  fields: Record<string, unknown>
): string[] {
  const schema = fieldsByType[type] as unknown as {
    shape: Record<string, z.ZodType>;
  };
  return requiredFieldKeys(schema).filter((key) => {
    const value = fields?.[key];
    return (
      value === undefined ||
      value === null ||
      value === "" ||
      (Array.isArray(value) && value.length === 0)
    );
  });
}
