import type {
  ApiAuthProvider,
  ApiUser,
  ApiUserCity,
  ApiUserRole,
} from "@/types/auth";

export interface UserUI {
  id: string;
  fullName: string;
  email: string;
  role: ApiUserRole;
  organization: string | null;
  isIndependent: boolean;
  city: ApiUserCity;
  cityOther: string | null;
  avatarUrl: string | null;
  emailVerifiedAt: string | null;
  isEmailVerified: boolean;
  authProvider: ApiAuthProvider;
  createdAt: string;
}

export interface SessionUI {
  token: string;
  expiresAt: string;
  user: UserUI;
}

export interface MePayload {
  user: ApiUser;
}
