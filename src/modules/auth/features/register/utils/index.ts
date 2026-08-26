import { API_ERROR_CODES } from "@/constants/api_error_codes";
import { isApiError } from "@/interceptors/api_error";
import { toAuthMessageKey, type AuthMessageKey } from "@/modules/auth/utils/messages";

import type { RegisterFormField } from "../schemas";

export const REGISTER_FIELD_IDS = {
  fullName: "register-full-name",
  email: "register-email",
  password: "register-password",
  organization: "register-organization",
  isIndependent: "register-is-independent",
  city: "register-city",
  cityOther: "register-city-other",
} as const satisfies Record<RegisterFormField, string>;

export const REGISTER_EMAIL_TAKEN_KEY: AuthMessageKey = "register.email_taken.message";

const SERVER_FIELDS: Record<string, RegisterFormField> = {
  full_name: "fullName",
  email: "email",
  password: "password",
  organization: "organization",
  is_independent: "isIndependent",
  city: "city",
  city_other: "cityOther",
};

export interface RegisterFieldError {
  field: RegisterFormField;
  key: AuthMessageKey;
}

export interface RegisterErrorResult {
  fieldErrors: readonly RegisterFieldError[];
  notify: boolean;
}

const toFieldErrors = (fields: Record<string, string> | null): RegisterFieldError[] => {
  if (fields === null) return [];
  const errors: RegisterFieldError[] = [];
  for (const [name, raw] of Object.entries(fields)) {
    const field = SERVER_FIELDS[name];
    if (field === undefined) continue;
    errors.push({ field, key: toAuthMessageKey(raw) });
  }
  return errors;
};

export const resolveRegisterError = (error: unknown): RegisterErrorResult => {
  if (!isApiError(error)) return { fieldErrors: [], notify: true };

  if (error.code === API_ERROR_CODES.EMAIL_ALREADY_REGISTERED) {
    return { fieldErrors: [{ field: "email", key: REGISTER_EMAIL_TAKEN_KEY }], notify: false };
  }

  if (error.code === API_ERROR_CODES.VALIDATION_ERROR) {
    const fieldErrors = toFieldErrors(error.fields);
    return { fieldErrors, notify: fieldErrors.length === 0 };
  }

  return { fieldErrors: [], notify: true };
};
