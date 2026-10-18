import type { LessonType, VideoProvider } from "@/modules/catalog/types";

export interface AdminLesson {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: LessonType;
  position: number;
  status: "DRAFT" | "PUBLISHED";
  is_free_sample: boolean;
  video: { provider: VideoProvider; external_id: string | null } | null;
  duration_seconds: number | null;
  article_body: string | null;
  article_word_count: number | null;
  reading_minutes: number | null;
  transcript: string | null;
  updated_at: string;
  resources: AdminResource[];
}
export interface AdminResource {
  id: string;
  title: string;
  file_url: string;
  mime_type: string;
  size_bytes: number;
  position: number;
}
export interface AdminLessonView {
  lesson: AdminLesson;
  course: { id: string; title: string };
}
export interface AdminLessonList {
  course: { id: string; title: string };
  lessons: Array<{
    id: string;
    title: string;
    type: LessonType;
    status: string;
    position: number;
    is_free_sample: boolean;
    duration_seconds: number | null;
    reading_minutes: number | null;
    resource_count: number;
    updated_at: string;
  }>;
}
export interface UpdateAdminLesson {
  title: string;
  description: string;
  type: LessonType;
  is_free_sample: boolean;
  video_provider?: VideoProvider | null;
  video_external_id?: string | null;
  duration_seconds?: number;
  article_body?: string | null;
  transcript?: string | null;
  confirm_type_change?: boolean;
}
export interface ProbeVideoResult {
  provider: VideoProvider;
  external_id: string;
  title?: string;
  duration_seconds: number | null;
}
export interface LessonDraft {
  title: string;
  description: string;
  type: LessonType;
  isFreeSample: boolean;
  videoProvider: VideoProvider;
  videoId: string;
  durationSeconds: string;
  articleBody: string;
  transcript: string;
  confirmTypeChange: boolean;
}
