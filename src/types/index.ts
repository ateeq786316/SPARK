import type { Database } from "@/types/database";

export type OpportunityStatus = Database["public"]["Enums"]["opportunity_status"];
export type ArticleStatus = Database["public"]["Enums"]["article_status"];
export type OpportunityType =
  | "scholarship"
  | "job"
  | "internship"
  | "fellowship"
  | "conference"
  | "exchange_program"
  | "competition"
  | "grant"
  | "professional_development";

export const OPPORTUNITY_TYPES: OpportunityType[] = [
  "scholarship",
  "job",
  "internship",
  "fellowship",
  "conference",
  "exchange_program",
  "competition",
  "grant",
  "professional_development",
];

export interface User {
  id: string;
  email: string;
  role: "user" | "admin";
  fullName: string | null;
  headline: string | null;
  country: string | null;
  interests: string[];
  newsletterOptIn: boolean;
  notificationSettings: {
    deadline_reminders: boolean;
    new_matches: boolean;
    digest: boolean;
    newsletter: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Opportunity {
  id: string;
  type: OpportunityType;
  slug: string;
  status: OpportunityStatus;
  title: string;
  summary: string | null;
  country: string | null;
  deadline: string | null;
  sourceUrl: string | null;
  fields: Record<string, unknown>;
  featured: boolean;
  viewCount: number;
  verifiedBy: string | null;
  verifiedAt: string | null;
  submitterId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogArticle {
  id: string;
  slug: string;
  status: ArticleStatus;
  title: string;
  featuredImage: string | null;
  authorId: string | null;
  categoryId: string | null;
  seoKeywords: string[];
  content: string;
  relatedPosts: string[];
  verifiedBy: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  kind: "opportunity" | "blog";
  createdAt: string;
}

export interface SavedItem {
  userId: string;
  opportunityId: string;
  createdAt: string;
}

export interface ApplicationRecord {
  userId: string;
  opportunityId: string;
  appliedAt: string;
  notes: string | null;
}

export interface Submission {
  id: string;
  submitterId: string;
  targetType: "opportunity" | "blog_article";
  payload: Record<string, unknown>;
  status: "pending" | "approved" | "rejected";
  reviewerId: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export interface ActivityMetric {
  action: "view" | "search" | "save" | "signup" | "subscribe";
  day: string;
  targetId: string | null;
  count: number;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  status: "active" | "unsubscribed";
  subscribedAt: string;
}
