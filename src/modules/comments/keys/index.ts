export const COMMENT_KEYS = {
  all: ["comments"] as const,
  lesson: (lessonId: string) => [...COMMENT_KEYS.all, lessonId] as const,
} as const;
