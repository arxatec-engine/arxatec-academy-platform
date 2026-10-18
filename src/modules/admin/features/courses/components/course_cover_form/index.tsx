import { Button, Image, Input, Label } from "arxatec-ui";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { NS } from "@/locales/namespaces";
import { AdminSection } from "@/modules/admin/components/admin_section";
import { useUploadAdminCover } from "@/modules/admin/hooks";
import { ADMIN_TEXT } from "@/modules/admin/i18n";
import type { AdminCourse } from "@/modules/admin/types";
import { COURSE_SETUP_TEXT } from "../../i18n/course_setup";
import { CourseStepActions } from "../course_step_actions";

interface Props {
  course: AdminCourse;
  onContinue?: () => void;
  onBack?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

export const CourseCoverForm = ({
  course,
  onContinue,
  onBack,
  onDirtyChange,
}: Props) => {
  const { t } = useTranslation(NS.common);
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadAdminCover(course.id);
  const save = () => {
    if (upload.isPending) return;
    if (!file) {
      onContinue?.();
      return;
    }
    void toast.promise(
      upload.mutateAsync(file).then(() => {
        setFile(null);
        if (inputRef.current) inputRef.current.value = "";
        onDirtyChange?.(false);
        onContinue?.();
      }),
      {
        loading: t(ADMIN_TEXT.upload),
        success: t(ADMIN_TEXT.saved),
        error: t(ADMIN_TEXT.failed),
      },
    );
  };
  return (
    <AdminSection
      title={t(ADMIN_TEXT.cover)}
      description={onContinue ? undefined : t(ADMIN_TEXT.coverHint)}
      showHeading={!onContinue}
      className={onContinue ? "border-0 pt-0" : undefined}
    >
      {course.cover_image_url && (
        <Image
          src={course.cover_image_url}
          alt={t(ADMIN_TEXT.cover)}
          className="aspect-video w-full max-w-xs overflow-hidden rounded-md border border-border"
          classNameImage="object-cover"
        />
      )}
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
        <Label htmlFor="admin-course-cover" className="sr-only">
          {t(ADMIN_TEXT.cover)}
        </Label>
        <Input
          ref={inputRef}
          size="sm"
          id="admin-course-cover"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="w-full min-w-0 flex-1"
          disabled={upload.isPending}
          onChange={(event) => {
            const next = event.target.files?.[0] ?? null;
            setFile(next);
            onDirtyChange?.(Boolean(next));
          }}
        />
        {!onContinue && (
          <Button
            size="sm"
            type="button"
            disabled={!file || upload.isPending}
            onClick={save}
          >
            {t(ADMIN_TEXT.upload)}
          </Button>
        )}
      </div>
      {onContinue && (
        <CourseStepActions
          onBack={onBack}
          onNext={save}
          disabled={upload.isPending}
          label={file ? t(COURSE_SETUP_TEXT.uploadContinue) : undefined}
        />
      )}
    </AdminSection>
  );
};
