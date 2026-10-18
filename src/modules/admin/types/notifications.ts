export interface SignupFilters {
  page: number;
  per_page?: number;
  course_id?: string;
  notified?: boolean;
}
export interface NoticeSignup {
  id: string;
  email: string;
  course: { id: string; title: string; slug: string } | null;
  created_at: string;
  notified_at: string | null;
  has_account: boolean;
}
export interface SignupList {
  signups: NoticeSignup[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    has_next: boolean;
  };
}
export interface TopicGroup {
  search_term: string;
  search_term_normalized: string;
  request_count: number;
  distinct_emails: number;
  last_requested_at: string;
}
export interface TopicList {
  topics: TopicGroup[];
}
