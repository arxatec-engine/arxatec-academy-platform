import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "arxatec-ui";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { NS } from "@/locales/namespaces";
import {
  useAdminLessonState,
  useDeleteAdminLesson,
} from "@/modules/admin/hooks/lessons";
import { ADMIN_TEXT } from "@/modules/admin/i18n";
import type { AdminLessonView } from "@/modules/admin/types/lessons";

interface Props {
  view: AdminLessonView;
  publishDisabled?: boolean;
  onDeleted: () => void;
}

export const LessonActions = ({ view, publishDisabled, onDeleted }: Props) => {
  const { t } = useTranslation(NS.common);
  const [open, setOpen] = useState(false);
  const state = useAdminLessonState(view.lesson.id);
  const remove = useDeleteAdminLesson(view.lesson.id, view.course.id);
  const changeState = (published: boolean) => {
    void toast.promise(state.mutateAsync(published), {
      loading: t(ADMIN_TEXT.save),
      success: t(ADMIN_TEXT.saved),
      error: t(ADMIN_TEXT.failed),
    });
  };
  const deleteLesson = () => {
    void toast.promise(
      remove.mutateAsync(true).then(() => {
        setOpen(false);
        onDeleted();
      }),
      {
        loading: t(ADMIN_TEXT.deleteLesson),
        success: t(ADMIN_TEXT.saved),
        error: t(ADMIN_TEXT.failed),
      },
    );
  };
  return (
    <div className="flex flex-wrap gap-2 border-t border-border pt-4">
      {view.lesson.status === "PUBLISHED" ? (
        <Button
          size="sm"
          type="button"
          variant="outline"
          disabled={state.isPending || remove.isPending}
          onClick={() => changeState(false)}
        >
          {t(ADMIN_TEXT.unpublish)}
        </Button>
      ) : (
        <Button
          size="sm"
          type="button"
          disabled={state.isPending || remove.isPending || publishDisabled}
          onClick={() => changeState(true)}
        >
          {t(ADMIN_TEXT.publish)}
        </Button>
      )}
      {view.lesson.status !== "PUBLISHED" && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" type="button" variant="destructive">
              {t(ADMIN_TEXT.deleteLesson)}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-lg font-normal">
                {t(ADMIN_TEXT.deleteLesson)}
              </DialogTitle>
              <DialogDescription>
                {t(ADMIN_TEXT.deleteLessonConfirm)}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button size="sm" type="button" variant="outline">
                  {t(ADMIN_TEXT.cancel)}
                </Button>
              </DialogClose>
              <Button
                size="sm"
                type="button"
                variant="destructive"
                disabled={remove.isPending}
                onClick={deleteLesson}
              >
                {t(ADMIN_TEXT.deleteLesson)}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
