import { useQuery } from "@tanstack/react-query";
import { getCertificate } from "../../services";

export const useCertificate = (id: string) =>
  useQuery({
    queryKey: ["certificates", id],
    queryFn: () => getCertificate(id),
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });
