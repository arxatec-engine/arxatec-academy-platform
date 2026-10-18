import type { DirectoryFilters } from "@/modules/admin/types/users";

export const directoryParams = (filters: DirectoryFilters): URLSearchParams => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === "") continue;
    params.set(key, Array.isArray(value) ? value.join(",") : String(value));
  }
  return params;
};
