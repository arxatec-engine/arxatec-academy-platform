import { z } from "zod";

import { AUTH_PASSWORD_MAX_LENGTH, AUTH_PASSWORD_MIN_LENGTH } from "@/modules/auth/constants";
import { API_USER_CITIES } from "@/types/auth";

import type { RegisterRequest } from "../types";

export const REGISTER_FULL_NAME_MIN_LENGTH = 2;
export const REGISTER_FULL_NAME_MAX_LENGTH = 120;
export const REGISTER_EMAIL_MAX_LENGTH = 254;
export const REGISTER_ORGANIZATION_MAX_LENGTH = 160;
export const REGISTER_CITY_OTHER_MAX_LENGTH = 120;

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, { error: "validation.full_name_required" })
      .max(REGISTER_FULL_NAME_MAX_LENGTH, { error: "validation.full_name_too_long" })
      .refine((value) => value.length === 0 || value.length >= REGISTER_FULL_NAME_MIN_LENGTH, {
        error: "validation.full_name_too_short",
      }),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, { error: "validation.email_required" })
      .max(REGISTER_EMAIL_MAX_LENGTH, { error: "validation.email_too_long" })
      .pipe(z.email({ error: "validation.email_invalid" })),
    password: z
      .string()
      .min(1, { error: "validation.password_required" })
      .max(AUTH_PASSWORD_MAX_LENGTH, { error: "validation.password_too_long" })
      .refine((value) => value.length === 0 || value.length >= AUTH_PASSWORD_MIN_LENGTH, {
        error: "validation.password_too_short",
      }),
    organization: z
      .string()
      .trim()
      .max(REGISTER_ORGANIZATION_MAX_LENGTH, { error: "validation.organization_too_long" }),
    isIndependent: z.boolean(),
    city: z.string().pipe(z.enum(API_USER_CITIES, { error: "validation.city_required" })),
    cityOther: z
      .string()
      .trim()
      .max(REGISTER_CITY_OTHER_MAX_LENGTH, { error: "validation.city_other_too_long" }),
  })
  .superRefine((values, ctx) => {
    if (values.city !== "OTHER" || values.cityOther.length > 0) return;
    ctx.addIssue({
      code: "custom",
      path: ["cityOther"],
      message: "validation.city_other_required",
    });
  });

export type RegisterFormInput = z.input<typeof registerSchema>;

export type RegisterFormValues = z.output<typeof registerSchema>;

export type RegisterFormField = keyof RegisterFormInput;

export const REGISTER_FORM_DEFAULTS: RegisterFormInput = {
  fullName: "",
  email: "",
  password: "",
  organization: "",
  isIndependent: false,
  city: "",
  cityOther: "",
};

export const toRegisterRequest = (values: RegisterFormValues): RegisterRequest => ({
  full_name: values.fullName,
  email: values.email,
  password: values.password,
  organization:
    values.isIndependent || values.organization.length === 0 ? null : values.organization,
  is_independent: values.isIndependent,
  city: values.city,
  city_other: values.city === "OTHER" ? values.cityOther : null,
});
