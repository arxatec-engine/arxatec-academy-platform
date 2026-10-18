export interface ApiComment {
  id: string;
  parent_id: string | null;
  body: string;
  created_at: string;
  author: {
    full_name: string;
    avatar_url: string | null;
    affiliation: string | null;
    is_team: boolean;
  } | null;
}
export interface ApiCommentThread extends ApiComment {
  replies: ApiComment[];
}

export interface Comment {
  id: string;
  parentId: string | null;
  body: string;
  createdAt: string;
  author: {
    fullName: string;
    avatarUrl: string | null;
    affiliation: string | null;
    isTeam: boolean;
  } | null;
}
export interface CommentThread extends Comment {
  replies: Comment[];
}
