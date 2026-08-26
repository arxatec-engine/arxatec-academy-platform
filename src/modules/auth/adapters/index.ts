import type { ApiSession, ApiUser } from "@/types/auth";

import type { SessionUI, UserUI } from "../types";

export const toUserUI = (user: ApiUser): UserUI => ({
  id: user.id,
  fullName: user.full_name,
  email: user.email,
  role: user.role,
  organization: user.organization,
  isIndependent: user.is_independent,
  city: user.city,
  cityOther: user.city_other,
  avatarUrl: user.avatar_url,
  emailVerifiedAt: user.email_verified_at,
  isEmailVerified: user.email_verified_at !== null,
  authProvider: user.auth_provider,
  createdAt: user.created_at,
});

export const toSessionUI = (session: ApiSession): SessionUI => ({
  token: session.token,
  expiresAt: session.expires_at,
  user: toUserUI(session.user),
});
