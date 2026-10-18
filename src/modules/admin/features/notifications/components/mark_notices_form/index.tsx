import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "arxatec-ui";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { NS } from "@/locales/namespaces";
import { useAdminCourses } from "@/modules/admin/hooks";
import { useMarkNoticeSignups } from "@/modules/admin/hooks/notifications";
import { NOTICES_TEXT } from "@/modules/admin/i18n";
import { NotificationSection } from "../notification_section";

interface Props {
  cutoff: string | null;
}

export const MarkNoticesForm = ({ cutoff }: Props) => {
  const { t } = useTranslation(NS.common);
  const courses = useAdminCourses();
  const mark = useMarkNoticeSignups();
  const [courseId, setCourseId] = useState("GENERAL");
  const submit = () => {
    if (!cutoff) return;
    void toast.promise(
      mark.mutateAsync({
        courseId: courseId === "GENERAL" ? null : courseId,
        signedUpBefore: cutoff,
      }),
      {
        loading: t(NOTICES_TEXT.mark),
        success: (count) => t(NOTICES_TEXT.marked, { count }),
        error: t(NOTICES_TEXT.mark),
      },
    );
  };
  return (
    <NotificationSection
      title={t(NOTICES_TEXT.mark)}
      description={t(NOTICES_TEXT.markInfo)}
    >
      {cutoff && (
        <p className="text-sm text-muted-foreground [overflow-wrap:anywhere]">
          {t(NOTICES_TEXT.exportCutoff, { date: cutoff })}
        </p>
      )}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <Select value={courseId} onValueChange={setCourseId}>
          <SelectTrigger
            size="sm"
            className="w-full min-w-0 bg-card sm:flex-1"
            aria-label={t(NOTICES_TEXT.mark)}
          >
            <SelectValue placeholder={t(NOTICES_TEXT.mark)} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GENERAL">{t(NOTICES_TEXT.general)}</SelectItem>
            {courses.data?.courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          type="button"
          disabled={mark.isPending || !cutoff}
          onClick={submit}
        >
          {t(NOTICES_TEXT.mark)}
        </Button>
      </div>
    </NotificationSection>
  );
};
