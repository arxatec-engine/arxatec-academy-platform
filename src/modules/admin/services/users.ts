import { axiosInstance } from "@/interceptors";
import type {
  DirectoryData,
  DirectoryFilters,
  DirectoryPage,
} from "@/modules/admin/types/users";
import { directoryParams } from "@/modules/admin/utils/users";
import type { Response, ResponseMeta } from "@/types/services";

export const listDirectory = async (
  filters: DirectoryFilters,
): Promise<DirectoryPage> => {
  const { data } = await axiosInstance.get<
    Response<DirectoryData> & {
      meta?: ResponseMeta & {
        pagination?: DirectoryPage["pagination"];
      };
    }
  >("/admin/users", { params: directoryParams(filters) });
  if (!data.data || !data.meta?.pagination)
    throw new Error("Missing directory page");
  return { ...data.data, pagination: data.meta.pagination };
};

export const exportDirectory = async (
  filters: DirectoryFilters,
): Promise<Blob> => {
  const { data } = await axiosInstance.get<Blob>("/admin/users/export", {
    params: directoryParams(filters),
    responseType: "blob",
  });
  return data;
};
