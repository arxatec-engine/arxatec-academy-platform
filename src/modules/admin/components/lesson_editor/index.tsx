import { AsyncBoundary, Button } from "arxatec-ui";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { LoadingScreen } from "@/components/shared/loading_screen";
import { NS } from "@/locales/namespaces";
import { useAdminLesson } from "@/modules/admin/hooks/lessons";
import { ADMIN_TEXT } from "@/modules/admin/i18n";
import { LessonActions } from "./components/lesson_actions";
import { LessonEditForm } from "./components/lesson_edit_form";
import { LessonResources } from "./components/lesson_resources";

interface Props {
  lessonId: string;
  autoFocus?: boolean;
  onDirtyChange: (dirty: boolean) => void;
  onDeleted: () => void;
}

export const AdminLessonEditor = ({
  lessonId,
  autoFocus,
  onDirtyChange,
  onDeleted,
}: Props) => {
  const { t } = useTranslation(NS.common);
  const query = useAdminLesson(lessonId, { throwOnError: false });
  const dirtyParts = useRef(new Set<string>());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const markDirty = (part: string, changed: boolean) => {
    if (changed) dirtyParts.current.add(part);
    else dirtyParts.current.delete(part);
    const dirty = dirtyParts.current.size > 0;
    setHasUnsavedChanges(dirty);
    onDirtyChange(dirty);
  };

  return (
    <AsyncBoundary
      isLoading={query.isPending}
      isError={query.isError && !query.data}
      data={query.data}
      LoadingComponent={<LoadingScreen />}
      ErrorComponent={
        <div role="alert" className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {t(ADMIN_TEXT.lessonLoadFailed)}
          </p>
          <Button
            size="sm"
            type="button"
            variant="outline"
            onClick={() => void query.refetch()}
          >
            {t(ADMIN_TEXT.retry)}
          </Button>
        </div>
      }
    >
      {(view) => (
        <div className="min-w-0 space-y-5">
          <LessonEditForm
            lesson={view.lesson}
            autoFocus={autoFocus}
            onDirtyChange={(dirty) => markDirty("content", dirty)}
          />
          <LessonResources
            lesson={view.lesson}
            onDirtyChange={(dirty) => markDirty("resources", dirty)}
          />
          {hasUnsavedChanges && (
            <p role="status" className="text-sm text-muted-foreground">
              {t(ADMIN_TEXT.lessonUnsaved)}
            </p>
          )}
          <LessonActions
            view={view}
            publishDisabled={hasUnsavedChanges}
            onDeleted={onDeleted}
          />
        </div>
      )}
    </AsyncBoundary>
  );
};
