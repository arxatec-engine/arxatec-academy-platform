import type {
  ApiComment,
  ApiCommentThread,
  Comment,
  CommentThread,
} from "@/modules/comments/types";

export const toComment = (entry: ApiComment): Comment => ({
  id: entry.id,
  parentId: entry.parent_id,
  body: entry.body,
  createdAt: entry.created_at,
  author:
    entry.author === null
      ? null
      : {
          fullName: entry.author.full_name,
          avatarUrl: entry.author.avatar_url,
          affiliation: entry.author.affiliation,
          isTeam: entry.author.is_team,
        },
});

export const toCommentThread = (entry: ApiCommentThread): CommentThread => ({
  ...toComment(entry),
  replies: entry.replies.map(toComment),
});
