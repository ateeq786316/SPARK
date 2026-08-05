import type { OpportunityType } from "@/types";

export const OPPORTUNITY_TYPE_LABELS: Record<OpportunityType, string> = {
  scholarship: "Scholarship",
  job: "Job",
  internship: "Internship",
  fellowship: "Fellowship",
  conference: "Conference",
  exchange_program: "Exchange",
  competition: "Competition",
  grant: "Grant",
  professional_development: "Professional Development",
};

export function typeLabel(type: OpportunityType): string {
  return OPPORTUNITY_TYPE_LABELS[type];
}

const deadlineFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function formatDeadline(isoDate: string): string {
  return deadlineFormatter.format(new Date(`${isoDate}T00:00:00`));
}

export function isExpired(isoDate: string): boolean {
  return new Date(`${isoDate}T00:00:00`).getTime() < Date.now();
}

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}
