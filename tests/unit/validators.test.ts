import { describe, expect, it } from "vitest";
import {
  opportunitySchema,
  missingRequiredFields,
} from "@/lib/validators/opportunity";

describe("opportunitySchema", () => {
  it("accepts a complete scholarship", () => {
    const result = opportunitySchema.safeParse({
      type: "scholarship",
      slug: "chevening-scholarships-2027",
      title: "Chevening Scholarships",
      source_url: "https://www.chevening.org/scholarships/",
      fields: {
        university: "UK universities",
        degree: "Master's",
        funding_type: "Fully funded",
        eligibility: "Open to all nationalities",
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid slug", () => {
    const result = opportunitySchema.safeParse({
      type: "job",
      slug: "Has Spaces And Caps",
      title: "Junior Engineer",
      fields: { organization: "Acme", location: "Remote", experience: "0-2" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects a scholarship missing required fields", () => {
    const result = opportunitySchema.safeParse({
      type: "scholarship",
      slug: "incomplete",
      title: "Incomplete",
      fields: {},
    });
    expect(result.success).toBe(false);
  });

  it("accepts each of the 9 opportunity types", () => {
    const cases: Array<{ type: string; fields: Record<string, unknown> }> = [
      { type: "scholarship", fields: { university: "u", degree: "d", funding_type: "f", eligibility: "e" } },
      { type: "job", fields: { organization: "o", location: "l", experience: "x" } },
      { type: "internship", fields: { company: "c", duration: "d", paid_unpaid: "p" } },
      { type: "fellowship", fields: { host: "h", eligibility: "e" } },
      { type: "conference", fields: { host: "h", eligibility: "e" } },
      { type: "exchange_program", fields: { host: "h", eligibility: "e" } },
      { type: "competition", fields: { organizer: "o" } },
      { type: "grant", fields: { grantor: "g" } },
      { type: "professional_development", fields: { provider: "p", format_duration: "f" } },
    ];

    for (const { type, fields } of cases) {
      const result = opportunitySchema.safeParse({
        type,
        slug: "valid-slug",
        title: "Valid",
        fields,
      });
      expect(result.success, `type ${type} should be valid`).toBe(true);
    }
  });
});

describe("missingRequiredFields", () => {
  it("lists the missing required fields for a scholarship", () => {
    expect(missingRequiredFields("scholarship", {})).toEqual([
      "university",
      "degree",
      "funding_type",
      "eligibility",
    ]);
  });

  it("returns an empty gap list for complete job fields", () => {
    expect(
      missingRequiredFields("job", {
        organization: "Acme",
        location: "Remote",
        experience: "0-2 years",
      })
    ).toEqual([]);
  });
});
