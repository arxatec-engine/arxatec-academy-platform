import { z } from "zod";

import { isSafeReturnPath } from "@/modules/auth/utils/redirect_to";

export const RETURN_PATH_ERROR_KEY = "errors.return_path_invalid";

export const returnPathSchema = z
  .string()
  .trim()
  .refine((value) => isSafeReturnPath(value), { message: RETURN_PATH_ERROR_KEY });

export type ReturnPath = z.infer<typeof returnPathSchema>;

export const parseReturnPath = (value: string | null | undefined): ReturnPath | null => {
  const result = returnPathSchema.safeParse(value);
  return result.success ? result.data : null;
};
