import { axiosInstance } from "@/interceptors";
import type {
  PasswordInput,
  ProfileChangesInput,
  ProfileInput,
  ProfileSummary,
  UserPayload,
} from "@/modules/profile/types";
import type { ApiUser } from "@/types/auth";
import type { Response } from "@/types/services";

export const getProfileSummary = async (): Promise<ProfileSummary> => {
  const { data } =
    await axiosInstance.get<Response<ProfileSummary>>("/me/summary");
  if (!data.data) throw new Error("Missing profile summary");
  return data.data;
};

export const updateProfile = async (input: ProfileInput): Promise<ApiUser> => {
  const { data } = await axiosInstance.patch<Response<UserPayload>>(
    "/me/profile",
    input,
  );
  if (!data.data) throw new Error("Missing updated user");
  return data.data.user;
};

export const updatePassword = async (input: PasswordInput): Promise<void> => {
  await axiosInstance.patch("/me/password", input);
};

export const uploadAvatar = async (file: File): Promise<ApiUser> => {
  const payload = new FormData();
  payload.append("file", file);
  const { data } = await axiosInstance.put<Response<UserPayload>>(
    "/me/avatar",
    payload,
  );
  if (!data.data) throw new Error("Missing updated user");
  return data.data.user;
};

export const saveProfile = async ({
  full_name,
  avatar,
}: ProfileChangesInput): Promise<ApiUser> => {
  const user = await updateProfile({ full_name });
  return avatar ? uploadAvatar(avatar) : user;
};

export const deleteAvatar = async (): Promise<ApiUser> => {
  const { data } =
    await axiosInstance.delete<Response<UserPayload>>("/me/avatar");
  if (!data.data) throw new Error("Missing updated user");
  return data.data.user;
};

export const deleteAccount = async (password: string | null): Promise<void> => {
  await axiosInstance.delete("/me", { data: { password } });
};
