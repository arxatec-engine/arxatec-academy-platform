import type { ApiSession } from "@/types/auth";

export interface LoginRequest {
  email: string;
  password: string;
  remember_me: boolean;
}

export type LoginPayload = ApiSession;
