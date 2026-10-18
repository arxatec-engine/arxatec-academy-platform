export const CATALOG_ENDPOINTS = {
  courses: "/courses",
  course: (slug: string): string => `/courses/${encodeURIComponent(slug)}`,
  lesson: (courseSlug: string, lessonSlug: string): string =>
    `/courses/${encodeURIComponent(courseSlug)}/lessons/${encodeURIComponent(lessonSlug)}`,
} as const;

export const COURSE_TOPICS = [
  "FIRST_STEPS",
  "LEGAL_ENGINEERING",
  "APPLIED_AI",
  "ARXATEC_PRODUCT",
] as const;
export const COURSE_LEVELS = ["INTRODUCTORY", "INTERMEDIATE"] as const;

export const CATALOG_SECTION_ID = "academy-courses";
