import { BookOpen, Mail, MessageSquare, UsersRound } from "lucide-react";
import {
  ADMIN_TEXT,
  DIRECTORY_TEXT,
  MODERATION_TEXT,
  NOTICES_TEXT,
} from "@/modules/admin/i18n";
import { ROUTES } from "@/routes/routes";

export const ADMIN_NAVIGATION = [
  { icon: BookOpen, label: ADMIN_TEXT.courses, path: ROUTES.admin_courses },
  {
    icon: MessageSquare,
    label: MODERATION_TEXT.title,
    path: ROUTES.admin_comments,
  },
  { icon: UsersRound, label: DIRECTORY_TEXT.title, path: ROUTES.admin_users },
  { icon: Mail, label: NOTICES_TEXT.title, path: ROUTES.admin_notifications },
] as const;
