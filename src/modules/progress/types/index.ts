export interface ApiEnrollment {
  course: { slug: string; title: string };
  certificate_id?: string | null;
  started_at: string;
  completed_at: string | null;
  completed_lessons: number;
  lesson_count: number;
  next_lesson: { slug: string; title: string } | null;
}
export interface ApiCourseInProgress {
  course: { slug: string; title: string };
  certificate_id?: string | null;
  completed_lessons: number;
  lesson_count: number;
  next_lesson: { slug: string; title: string } | null;
}
export interface ApiCourseCompleted {
  course: { slug: string; title: string };
  certificate_id?: string | null;
  lesson_count: number;
  completed_at: string;
}
export interface ApiMyCourses {
  in_progress: ApiCourseInProgress[];
  completed: ApiCourseCompleted[];
}
export interface ApiLessonMark {
  lesson_id: string;
  completed_at: string | null;
  enrollment: ApiEnrollment | null;
}

export interface CourseInProgress {
  course: ApiCourseInProgress["course"];
  certificateId?: string | null;
  completedLessons: number;
  lessonCount: number;
  nextLesson: ApiCourseInProgress["next_lesson"];
}
export interface CourseCompleted {
  course: ApiCourseCompleted["course"];
  certificateId?: string | null;
  lessonCount: number;
  completedAt: string;
}
export interface MyCourses {
  inProgress: CourseInProgress[];
  completed: CourseCompleted[];
}
