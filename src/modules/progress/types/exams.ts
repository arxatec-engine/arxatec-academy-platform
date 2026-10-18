export interface ExamQuestion {
  text: string;
  options: string[];
  correct_option: number;
}
export interface AdminCourseExam {
  version: number;
  enabled: boolean;
  passing_score: number;
  questions: ExamQuestion[];
  updated_at: string;
}
export interface SaveCourseExam {
  expected_version: number;
  enabled: boolean;
  passing_score: number;
  questions: ExamQuestion[];
}
export interface ExamResult {
  score: number | null;
  passed: boolean;
  passing_score: number;
  question_count: number;
  certificate_id: string | null;
}
export interface CourseExam {
  course: { slug: string; title: string };
  status: "unavailable" | "locked" | "ready" | "passed";
  version: number | null;
  question_count: number;
  passing_score: number;
  questions: Omit<ExamQuestion, "correct_option">[];
  certificate_id: string | null;
  last_result: ExamResult | null;
}
export interface SubmitCourseExam {
  version: number;
  answers: number[];
}
