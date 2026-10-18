import { z } from "zod";
import { EXAM_RULES } from "@/modules/progress/constants/exams";

export const adminExamSchema = z.object({
  expected_version: z.number().int().min(0),
  enabled: z.boolean(),
  passing_score: z.number().int().min(1).max(EXAM_RULES.questionCount),
  questions: z
    .array(
      z.object({
        text: z.string().trim().min(1).max(EXAM_RULES.questionMaxLength),
        options: z
          .array(z.string().trim().min(1).max(EXAM_RULES.optionMaxLength))
          .length(EXAM_RULES.optionCount)
          .refine(
            (options) =>
              new Set(options.map((option) => option.toLowerCase())).size ===
              options.length,
          ),
        correct_option: z
          .number()
          .int()
          .min(0)
          .max(EXAM_RULES.optionCount - 1),
      }),
    )
    .length(EXAM_RULES.questionCount),
});
