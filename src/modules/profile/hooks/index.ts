import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PROFILE_KEYS } from "@/modules/profile/keys";
import {
  deleteAccount,
  deleteAvatar,
  getProfileSummary,
  saveProfile,
  updatePassword,
  updateProfile,
  uploadAvatar,
} from "@/modules/profile/services";
import { useUserStore } from "@/store/user";

export const useProfileSummary = () =>
  useQuery({ queryKey: PROFILE_KEYS.summary(), queryFn: getProfileSummary });

export const useUpdateProfile = () => {
  const setUser = useUserStore((state) => state.setUser);
  return useMutation({ mutationFn: updateProfile, onSuccess: setUser });
};

export const useSaveProfile = () => {
  const setUser = useUserStore((state) => state.setUser);
  return useMutation({ mutationFn: saveProfile, onSuccess: setUser });
};

export const useUpdatePassword = () =>
  useMutation({ mutationFn: updatePassword });

export const useUploadAvatar = () => {
  const setUser = useUserStore((state) => state.setUser);
  return useMutation({ mutationFn: uploadAvatar, onSuccess: setUser });
};

export const useDeleteAvatar = () => {
  const setUser = useUserStore((state) => state.setUser);
  return useMutation({ mutationFn: deleteAvatar, onSuccess: setUser });
};

export const useDeleteAccount = () => {
  const client = useQueryClient();
  const clearUser = useUserStore((state) => state.clearUser);
  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      clearUser();
      client.clear();
    },
  });
};
