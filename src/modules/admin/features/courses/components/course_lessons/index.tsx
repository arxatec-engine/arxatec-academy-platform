import { useIsMutating } from "@tanstack/react-query";
import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  StatusMessage,
} from "arxatec-ui";
import { ArrowDown, ArrowUp, BookOpen, ChevronDown } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { UI_TEXT } from "@/components/shared/i18n";
import { NS } from "@/locales/namespaces";
import { AdminSection } from "@/modules/admin/components/admin_section";
import { AdminLessonEditor } from "@/modules/admin/components/lesson_editor";
import { useReorderAdminLessons } from "@/modules/admin/hooks/lessons";
import { ADMIN_TEXT } from "@/modules/admin/i18n";
import type { AdminCourseView } from "@/modules/admin/types";
import { ROUTE_QUERY_PARAM_NAMES } from "@/routes/routes";
import { cn } from "@/utilities/cn";
import { CreateLessonForm } from "../create_lesson_form";

interface Props {
  view: AdminCourseView;
  embedded?: boolean;
  onDirtyChange?: (dirty: boolean) => void;
}

export const CourseLessons = ({ view, embedded, onDirtyChange }: Props) => {
  const { t } = useTranslation(NS.common);
  const [search, setSearch] = useSearchParams();
  const requestedId = search.get(ROUTE_QUERY_PARAM_NAMES.lesson_id);
  const openId = view.lessons.some((lesson) => lesson.id === requestedId)
    ? requestedId
    : null;
  const [visited, setVisited] = useState<Set<string>>(
    () => new Set(openId ? [openId] : []),
  );
  const dirtyParts = useRef(new Set<string>());
  const [dirtyIds, setDirtyIds] = useState(new Set<string>());
  const [createdId, setCreatedId] = useState<string | null>(null);
  const isSaving = useIsMutating() > 0;
  const reorder = useReorderAdminLessons(view.course.id);
  const markDirty = (id: string, changed: boolean) => {
    if (dirtyParts.current.has(id) === changed) return;
    const next = new Set(dirtyParts.current);
    if (changed) next.add(id);
    else next.delete(id);
    dirtyParts.current = next;
    setDirtyIds(next);
    onDirtyChange?.(next.size > 0);
  };
  const expand = (id: string | null) => {
    setVisited(
      (current) =>
        new Set([...current, ...(openId ? [openId] : []), ...(id ? [id] : [])]),
    );
    setSearch(
      (current) => {
        const next = new URLSearchParams(current);
        if (id) next.set(ROUTE_QUERY_PARAM_NAMES.lesson_id, id);
        else next.delete(ROUTE_QUERY_PARAM_NAMES.lesson_id);
        return next;
      },
      { replace: true },
    );
  };
  const move = (index: number, offset: number) => {
    const ids = view.lessons.map((lesson) => lesson.id);
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
      title={t(ADMIN_TEXT.lessons)}
      showHeading={!embedded}
      className={embedded ? "border-0 pt-0" : undefined}
    >
      {view.lessons.length === 0 && (
        <div role="status">
          <StatusMessage
            size="sm"
            color="white"
            icon={BookOpen}
            title={t(ADMIN_TEXT.lessons)}
            description={t(UI_TEXT.empty)}
          />
        </div>
      )}
      <ol className="space-y-3">
        {view.lessons.map((lesson, index) => (
          <Collapsible
            key={lesson.id}
            asChild
            open={openId === lesson.id}
            onOpenChange={(open) => expand(open ? lesson.id : null)}
          >
            <li className="min-w-0 rounded-md border border-border">
              <div className="flex items-start gap-1 p-2">
                <CollapsibleTrigger asChild>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    aria-label={lesson.title}
                    disabled={isSaving}
                    className="h-auto min-w-0 flex-1 items-start justify-start gap-2 px-2 py-2 text-left font-normal whitespace-normal"
                  >
                    <span className="w-5 shrink-0 text-muted-foreground">
                      {lesson.position}.
                    </span>
                    <span className="min-w-0 flex-1 space-y-1">
                      <span className="block [overflow-wrap:anywhere]">
                        {lesson.title}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {t(
                          lesson.status === "PUBLISHED"
                            ? ADMIN_TEXT.published
                            : lesson.status === "ARCHIVED"
                              ? ADMIN_TEXT.archived
                              : ADMIN_TEXT.draft,
                        )}
                      </span>
                      {dirtyIds.has(lesson.id) && (
                        <span className="block text-xs text-muted-foreground">
                          {t(ADMIN_TEXT.lessonUnsaved)}
                        </span>
                      )}
                    </span>
                    <ChevronDown
                      aria-hidden="true"
                      className={cn(
                        "mt-0.5 size-4 shrink-0 transition-transform",
                        openId === lesson.id && "rotate-180",
                      )}
                    />
                  </Button>
                </CollapsibleTrigger>
                <div className="flex shrink-0 gap-1 pt-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="size-8 p-0 text-muted-foreground"
                    aria-label={`${t(ADMIN_TEXT.moveUp)}: ${lesson.title}`}
                    title={t(ADMIN_TEXT.moveUp)}
                    disabled={index === 0 || isSaving}
                    onClick={() => move(index, -1)}
                  >
                    <ArrowUp aria-hidden="true" className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="size-8 p-0 text-muted-foreground"
                    aria-label={`${t(ADMIN_TEXT.moveDown)}: ${lesson.title}`}
                    title={t(ADMIN_TEXT.moveDown)}
                    disabled={index === view.lessons.length - 1 || isSaving}
                    onClick={() => move(index, 1)}
                  >
                    <ArrowDown aria-hidden="true" className="size-4" />
                  </Button>
                </div>
              </div>
              {(visited.has(lesson.id) || openId === lesson.id) && (
                <CollapsibleContent
                  forceMount
                  hidden={openId !== lesson.id}
                  role="region"
                  aria-label={`${t(ADMIN_TEXT.edit)}: ${lesson.title}`}
                  className="border-t border-border p-(--admin-content-padding) [--admin-content-padding:0.75rem] sm:[--admin-content-padding:1rem]"
                >
                  <AdminLessonEditor
                    lessonId={lesson.id}
                    autoFocus={createdId === lesson.id}
                    onDirtyChange={(changed) => markDirty(lesson.id, changed)}
                    onDeleted={() => {
                      markDirty(lesson.id, false);
                      expand(null);
                      requestAnimationFrame(() =>
                        document.getElementById("new-lesson-title")?.focus(),
                      );
                    }}
                  />
                </CollapsibleContent>
              )}
            </li>
          </Collapsible>
        ))}
      </ol>
      <CreateLessonForm
        courseId={view.course.id}
        onCreated={(created) => {
          setCreatedId(created.lesson.id);
          expand(created.lesson.id);
        }}
        onDirtyChange={(changed) => markDirty("new-lesson", changed)}
      />
    </AdminSection>
  );
};
