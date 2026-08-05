import type { Database } from "@/types/database";
import type { Opportunity, BlogArticle, OpportunityType } from "@/types";

type OpportunityRow = Database["public"]["Tables"]["opportunities"]["Row"];
type BlogArticleRow = Database["public"]["Tables"]["blog_articles"]["Row"];

export function mapOpportunity(row: OpportunityRow): Opportunity {
  return {
    id: row.id,
    type: row.type as OpportunityType,
    slug: row.slug,
    status: row.status,
    title: row.title,
    summary: row.summary,
    country: row.country,
    deadline: row.deadline,
    sourceUrl: row.source_url,
    fields: (row.fields ?? {}) as Record<string, unknown>,
    featured: row.featured,
    featuredImage: row.featured_image,
    viewCount: row.view_count,
    verifiedBy: row.verified_by,
    verifiedAt: row.verified_at,
    submitterId: row.submitter_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapBlogArticle(row: BlogArticleRow): BlogArticle {
  return {
    id: row.id,
    slug: row.slug,
    status: row.status,
    title: row.title,
    featuredImage: row.featured_image,
    authorId: row.author_id,
    categoryId: row.category_id,
    seoKeywords: row.seo_keywords ?? [],
    content: row.content,
    relatedPosts: row.related_posts ?? [],
    verifiedBy: row.verified_by,
    verifiedAt: row.verified_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
