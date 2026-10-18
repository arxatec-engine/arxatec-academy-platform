import { API_ERROR_CODES } from "@/constants/api_error_codes";
import { axiosInstance, axiosPublicInstance } from "@/interceptors";
import { ApiError } from "@/interceptors/api_error";
import { toComment, toCommentThread } from "@/modules/comments/adapters";
import type {
  ApiComment,
  ApiCommentThread,
  Comment,
  CommentThread,
} from "@/modules/comments/types";
import type { Response } from "@/types/services";

const malformed = (description: string): ApiError =>
  new ApiError({
    status: 500,
    code: API_ERROR_CODES.INTERNAL_ERROR,
    description,
    fields: null,
    retryAfterSeconds: null,
  });

export const getComments = async (
  lessonId: string,
): Promise<CommentThread[]> => {
  const { data } = await axiosPublicInstance.get<
    Response<{ comments: ApiCommentThread[] }>
  >(`/lessons/${encodeURIComponent(lessonId)}/comments`);
  if (!data.data) throw malformed(data.description);
  return data.data.comments.map(toCommentThread);
};

export const createComment = async ({
  lessonId,
  body,
}: {
  lessonId: string;
  body: string;
}): Promise<Comment> => {
  const { data } = await axiosInstance.post<Response<{ comment: ApiComment }>>(
    `/lessons/${encodeURIComponent(lessonId)}/comments`,
    { body },
  );
  if (!data.data) throw malformed(data.description);
  return toComment(data.data.comment);
};

export const replyToComment = async ({
  commentId,
  body,
}: {
  commentId: string;
  body: string;
}): Promise<Comment> => {
  const { data } = await axiosInstance.post<Response<{ comment: ApiComment }>>(
    `/comments/${encodeURIComponent(commentId)}/replies`,
    { body },
  );
  if (!data.data) throw malformed(data.description);
  return toComment(data.data.comment);
};

export const reportComment = async (commentId: string): Promise<void> => {
  await axiosInstance.post(
    `/comments/${encodeURIComponent(commentId)}/report`,
    { reason: null },
  );
};
