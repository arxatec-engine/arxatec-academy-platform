export type ModerationTab = "recent" | "reported" | "hidden";
export interface ModerationCounts {
  pending: number;
  reported: number;
}
export interface ModerationComment {
  id: string;
  created_at: string;
  status: "VISIBLE" | "HIDDEN" | "DELETED";
  body: string;
  is_reply: boolean;
  parent_id: string | null;
  is_answered: boolean | null;
  report_count: number;
  is_public: boolean;
  author: {
    full_name: string;
    avatar_url: string | null;
    is_team: boolean;
  } | null;
  course: { slug: string; title: string };
  lesson: { slug: string; title: string; position: number };
}
export interface ModerationList {
  comments: ModerationComment[];
  counts: ModerationCounts;
  pagination: {
    page: number;
    page_size: number;
    total: number;
    has_next: boolean;
  };
}
