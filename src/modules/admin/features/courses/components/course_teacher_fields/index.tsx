import {
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  StatusMessage,
  Textarea,
} from "arxatec-ui";
import { useTranslation } from "react-i18next";
import { NS } from "@/locales/namespaces";
import { useAdminTeachers } from "@/modules/admin/hooks";
import { ADMIN_TEXT } from "@/modules/admin/i18n";
import type { AdminTeacherInput } from "@/modules/admin/types";

interface Props {
  value: AdminTeacherInput | null;
  onChange: (teacher: AdminTeacherInput | null) => void;
  disabled?: boolean;
}

export const CourseTeacherFields = ({ value, onChange, disabled }: Props) => {
  const { t } = useTranslation(NS.common);
  const query = useAdminTeachers();
  const teachers = [...(query.data?.teachers ?? [])];
  if (value?.id && !teachers.some((teacher) => teacher.id === value.id)) {
    teachers.push({ ...value, id: value.id });
  }

  return (
    <fieldset
      disabled={disabled}
      className="min-w-0 space-y-3 border-t border-border pt-4"
    >
      <legend className="sr-only">{t(ADMIN_TEXT.teacher)}</legend>
      <div className="space-y-1.5">
        <Label htmlFor="admin-course-teacher">{t(ADMIN_TEXT.teacher)}</Label>
        <Select
          value={value?.id ?? (value ? "NEW" : "NONE")}
          disabled={disabled || query.isPending}
          onValueChange={(id) => {
            if (id === "NONE") onChange(null);
            else if (id === "NEW")
              onChange({ full_name: "", biography: "", photo_url: null });
            else {
              const teacher = teachers.find((entry) => entry.id === id);
              if (teacher) onChange(teacher);
            }
          }}
        >
          <SelectTrigger size="sm" id="admin-course-teacher" className="w-full">
            <SelectValue placeholder={t(ADMIN_TEXT.teacher)} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NONE">{t(ADMIN_TEXT.teacherNone)}</SelectItem>
            <SelectItem value="NEW">{t(ADMIN_TEXT.teacherNew)}</SelectItem>
            {teachers.map((teacher) => (
              <SelectItem key={teacher.id} value={teacher.id}>
                {teacher.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {query.isError && (
        <div role="alert">
          <StatusMessage
            size="sm"
            title={t(ADMIN_TEXT.teacher)}
            description={t(ADMIN_TEXT.teachersLoadFailed)}
          />
        </div>
      )}
      {value && (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="admin-teacher-name">
              {t(ADMIN_TEXT.teacherName)}
            </Label>
            <Input
              size="sm"
              id="admin-teacher-name"
              required
              maxLength={120}
              placeholder={t(ADMIN_TEXT.teacherName)}
              value={value.full_name}
              onChange={(event) =>
                onChange({ ...value, full_name: event.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="admin-teacher-biography">
              {t(ADMIN_TEXT.teacherBiography)}
            </Label>
            <Textarea
              id="admin-teacher-biography"
              required
              maxLength={2000}
              rows={3}
              className="text-sm"
              placeholder={t(ADMIN_TEXT.teacherBiography)}
              value={value.biography}
              onChange={(event) =>
                onChange({ ...value, biography: event.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="admin-teacher-photo">
              {t(ADMIN_TEXT.teacherPhotoUrl)}
            </Label>
            <Input
              size="sm"
              id="admin-teacher-photo"
              type="url"
              maxLength={2048}
              placeholder={t(ADMIN_TEXT.teacherPhotoUrl)}
              value={value.photo_url ?? ""}
              onChange={(event) =>
                onChange({ ...value, photo_url: event.target.value })
              }
            />
          </div>
          {value.id && (
            <p className="text-sm text-muted-foreground">
              {t(ADMIN_TEXT.teacherSharedHint)}
            </p>
          )}
        </>
      )}
    </fieldset>
  );
};
