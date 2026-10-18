import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { NS } from "@/locales/namespaces";
import { AdminSection } from "@/modules/admin/components/admin_section";
import { useReorderAdminResources } from "@/modules/admin/hooks/lessons";
import { ADMIN_TEXT } from "@/modules/admin/i18n";
import type { AdminLesson } from "@/modules/admin/types/lessons";
import { ResourceRow } from "../resource_row";
import { ResourceUploadForm } from "../resource_upload_form";

interface Props {
  lesson: AdminLesson;
  onDirtyChange: (dirty: boolean) => void;
}

export const LessonResources = ({ lesson, onDirtyChange }: Props) => {
  const { t } = useTranslation(NS.common);
  const reorder = useReorderAdminResources(lesson.id);
  const dirtyParts = useRef(new Set<string>());
  const markDirty = (part: string, dirty: boolean) => {
    if (dirty) dirtyParts.current.add(part);
    else dirtyParts.current.delete(part);
    onDirtyChange(dirtyParts.current.size > 0);
  };
  const move = (index: number, offset: number) => {
    const ids = lesson.resources.map((resource) => resource.id);
    const target = index + offset;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target]!, ids[index]!];
    void toast.promise(reorder.mutateAsync(ids), {
      loading: t(ADMIN_TEXT.save),
      success: t(ADMIN_TEXT.saved),
      error: t(ADMIN_TEXT.failed),
    });
  };
  return (
    <AdminSection
      title={t(ADMIN_TEXT.resources)}
      className="-mx-(--admin-content-padding) px-(--admin-content-padding)"
    >
      <ol className="-mx-(--admin-content-padding) divide-y divide-border">
        {lesson.resources.map((resource, index) => (
          <ResourceRow
            key={resource.id}
            resource={resource}
            lessonId={lesson.id}
            index={index}
            total={lesson.resources.length}
            onMove={(offset) => move(index, offset)}
            onDirtyChange={(dirty) => markDirty(resource.id, dirty)}
          />
        ))}
      </ol>
      <ResourceUploadForm
        lessonId={lesson.id}
        onDirtyChange={(dirty) => markDirty("upload", dirty)}
      />
    </AdminSection>
  );
};
