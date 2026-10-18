export const COURSE_SETUP_STEP = {
  details: "details",
  teacher: "teacher",
  cover: "cover",
  lessons: "lessons",
  exam: "exam",
  publication: "publication",
} as const;

export type CourseSetupStep =
  (typeof COURSE_SETUP_STEP)[keyof typeof COURSE_SETUP_STEP];
