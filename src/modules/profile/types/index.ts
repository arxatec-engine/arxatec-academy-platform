import type { ApiUser } from "@/types/auth";

export interface ProfileInput {
  full_name: string;
}

export interface ProfileChangesInput extends ProfileInput {
  avatar?: File;
}

export interface PasswordInput {
  current_password: string;
  new_password: string;
}
export interface ProfileSummary {
  member_since: string;
  completed_courses: number;
}
export interface UserPayload {
  user: ApiUser;
}
