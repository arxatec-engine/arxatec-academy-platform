import type { ApiSession, ApiUser } from "@/types/auth";

export const buildApiUser = (overrides: Partial<ApiUser> = {}): ApiUser => ({
  id: "usr_01JTESTTESTTESTTESTTEST",
  full_name: "María Quispe Rojas",
  email: "maria@estudioqp.pe",
  role: "STUDENT",
  organization: "Estudio Quispe & Rojas",
  is_independent: false,
  city: "LIMA",
  city_other: null,
  avatar_url: null,
  email_verified_at: null,
  auth_provider: "PASSWORD",
  created_at: "2026-05-12T10:00:00.000Z",
  ...overrides,
});

export const buildApiSession = (overrides: Partial<ApiSession> = {}): ApiSession => ({
  token: "test.jwt.token",
  expires_at: "2026-09-19T12:00:00.000Z",
  user: buildApiUser(),
  ...overrides,
});
