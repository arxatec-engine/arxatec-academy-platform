export const ADMIN_KEYS = {
  all: ["admin"] as const,
  teachers: () => ["admin", "teachers"] as const,
  courses: () => ["admin", "courses"] as const,
  course: (id: string) => ["admin", "courses", id] as const,
} as const;

export const ADMIN_LESSON_KEYS = {
  all: ["admin", "lessons"] as const,
  list: (courseId: string) => ["admin", "lessons", "course", courseId] as const,
  detail: (id: string) => ["admin", "lessons", id] as const,
} as const;
