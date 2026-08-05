import type { OpportunityType } from "@/types";

export const FIELD_LABELS: Record<OpportunityType, Record<string, string>> = {
  scholarship: {
    university: "University",
    degree: "Degree",
    funding_type: "Funding type",
    eligibility: "Eligibility",
    cgpa: "Minimum CGPA",
    ielts_toefl: "IELTS / TOEFL",
    required_documents: "Required documents",
    benefits: "Benefits",
  },
  job: {
    organization: "Organization",
    location: "Location",
    experience: "Experience",
    salary: "Salary",
  },
  internship: {
    company: "Company",
    duration: "Duration",
    paid_unpaid: "Paid / unpaid",
    skills: "Skills",
  },
  fellowship: {
    host: "Host",
    eligibility: "Eligibility",
    benefits: "Benefits",
    dates: "Dates",
  },
  conference: {
    host: "Host",
    eligibility: "Eligibility",
    benefits: "Benefits",
    dates: "Dates",
  },
  exchange_program: {
    host: "Host",
    eligibility: "Eligibility",
    benefits: "Benefits",
    dates: "Dates",
  },
  competition: {
    organizer: "Organizer",
    prizes: "Prizes",
  },
  grant: {
    grantor: "Grantor",
    amount: "Amount",
  },
  professional_development: {
    provider: "Provider",
    format_duration: "Format / duration",
    fees: "Fees",
  },
};
