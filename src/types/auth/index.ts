export const API_USER_ROLES = ["STUDENT", "ADMIN"] as const;
export type ApiUserRole = (typeof API_USER_ROLES)[number];

export const API_USER_CITIES = ["LIMA", "AREQUIPA", "TRUJILLO", "OTHER"] as const;
export type ApiUserCity = (typeof API_USER_CITIES)[number];

export const API_AUTH_PROVIDERS = ["PASSWORD", "GOOGLE"] as const;
export type ApiAuthProvider = (typeof API_AUTH_PROVIDERS)[number];

export interface ApiUser {
  id: string;
  full_name: string;
  email: string;
  role: ApiUserRole;
  organization: string | null;
  is_independent: boolean;
  city: ApiUserCity;
  city_other: string | null;
  avatar_url: string | null;
  email_verified_at: string | null;
  auth_provider: ApiAuthProvider;
  created_at: string;
}

export interface ApiSession {
  token: string;
  expires_at: string;
  user: ApiUser;
}
