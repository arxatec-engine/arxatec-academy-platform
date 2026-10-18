import { useMutation } from "@tanstack/react-query";
import {
  requestTopic,
  signUpForNotice,
} from "@/modules/notifications/services";

export const useSignUpForNotice = () =>
  useMutation({
    mutationFn: ({
      email,
      courseSlug,
    }: {
      email?: string;
      courseSlug?: string;
    }) => signUpForNotice(email, courseSlug),
  });

export const useRequestTopic = () =>
  useMutation({
    mutationFn: ({
      searchTerm,
      email,
    }: {
      searchTerm: string;
      email?: string;
    }) => requestTopic(searchTerm, email),
  });
