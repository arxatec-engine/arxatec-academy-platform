import type { ApiUserCity } from "@/types/auth";

export interface DirectoryFilters {
  search?: string;
  city?: ApiUserCity[];
  registered_from?: string;
  registered_to?: string;
  is_independent?: boolean;
  email_verified?: boolean;
  has_completed?: boolean;
  completed_topic?: string[];
  sort?: "created_at" | "full_name";
  page: number;
  per_page?: number;
}
export interface DirectoryUser {
  id: string;
  full_name: string;
  email: string;
  organization: string | null;
  is_independent: boolean;
  city: ApiUserCity;
  city_other: string | null;
  created_at: string;
  email_verified_at: string | null;
  completed_courses: number;
}
export interface DirectoryData {
  users: DirectoryUser[];
  stats: {
    total_registered: number;
    registered_this_week: number;
    week_start: string;
  };
}
export interface DirectoryPage extends DirectoryData {
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}
