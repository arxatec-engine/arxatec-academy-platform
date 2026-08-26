import type { Control } from "react-hook-form";

import type { ApiSession, ApiUserCity } from "@/types/auth";

import type { RegisterFormInput, RegisterFormValues } from "../schemas";

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
  organization: string | null;
  is_independent: boolean;
  city: ApiUserCity;
  city_other: string | null;
}

export type RegisterPayload = ApiSession;

export type RegisterFormControl = Control<RegisterFormInput, unknown, RegisterFormValues>;
