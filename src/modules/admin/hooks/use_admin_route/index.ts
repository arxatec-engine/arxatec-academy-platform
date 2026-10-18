import { useParams } from "react-router-dom";

export const useAdminRoute = () => {
  const { id } = useParams<"id">();
  return { id };
};
