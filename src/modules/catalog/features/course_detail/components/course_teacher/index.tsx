import { Avatar, AvatarFallback, AvatarImage } from "arxatec-ui";
import { useTranslation } from "react-i18next";
import { NS } from "@/locales/namespaces";
import { COURSE_TEXT } from "@/modules/catalog/i18n";
import type { Teacher } from "@/modules/catalog/types";

interface Props {
  teacher: Teacher | null;
}

export const CourseTeacher = ({ teacher }: Props) => {
  const { t } = useTranslation(NS.common);
  if (!teacher) return null;
  const initials = teacher.fullName
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  return (
    <section
      className="mt-6 border-t border-border pt-4"
      aria-labelledby="course-teacher-title"
    >
      <h2 id="course-teacher-title" className="text-lg">
        {t(COURSE_TEXT.teacher)}
      </h2>
      <div className="mt-3 flex items-start gap-4">
        <Avatar className="size-16 shrink-0">
          <AvatarImage
            src={teacher.photoUrl ?? undefined}
            alt={teacher.fullName}
          />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 space-y-1">
          <h3 className="text-base font-normal [overflow-wrap:anywhere]">
            {teacher.fullName}
          </h3>
          <p className="whitespace-pre-line text-sm text-muted-foreground [overflow-wrap:anywhere]">
            {teacher.biography}
          </p>
        </div>
      </div>
    </section>
  );
};
