import type { ApiSession } from "@/types/auth";

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
}

export interface RegisterPayload extends ApiSession {
  verification_email_sent: boolean;
}
