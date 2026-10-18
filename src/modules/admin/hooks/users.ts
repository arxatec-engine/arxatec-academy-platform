import { useMutation, useQuery } from "@tanstack/react-query";
import { exportDirectory, listDirectory } from "@/modules/admin/services/users";
import type { DirectoryFilters } from "@/modules/admin/types/users";

export const useDirectory = (filters: DirectoryFilters) =>
  useQuery({
    queryKey: ["admin", "users", filters],
    queryFn: () => listDirectory(filters),
  });

export const useExportDirectory = () =>
  useMutation({
    mutationFn: exportDirectory,
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "usuarios.csv";
      link.click();
      URL.revokeObjectURL(url);
    },
  });
