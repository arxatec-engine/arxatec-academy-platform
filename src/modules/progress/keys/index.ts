export const PROGRESS_KEYS = {
  all: ["progress"] as const,
  myCourses: () => [...PROGRESS_KEYS.all, "my_courses"] as const,
} as const;
