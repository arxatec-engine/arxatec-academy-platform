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
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { NS } from "@/locales/namespaces";
import { useAdminCourseAction } from "@/modules/admin/hooks";
import { ADMIN_TEXT } from "@/modules/admin/i18n";
import type { AdminCourse, AdminCourseAction } from "@/modules/admin/types";
import { RouteHelpers } from "@/routes/routes";

interface Props {
  course: AdminCourse;
  publishDisabled?: boolean;
}

export const CourseActions = ({ course, publishDisabled }: Props) => {
  const { t } = useTranslation(NS.common);
  const navigate = useNavigate();
  const action = useAdminCourseAction();
  const [archiveOpen, setArchiveOpen] = useState(false);
  const run = (command: AdminCourseAction) => {
    void toast.promise(
      action.mutateAsync({ id: course.id, action: command }).then((view) => {
        if (command === "duplicate")
          void navigate(RouteHelpers.adminCourse(view.course.id));
        if (command === "archive") setArchiveOpen(false);
      }),
      {
        loading: t(ADMIN_TEXT[command]),
        success: t(
          command === "duplicate" ? ADMIN_TEXT.duplicated : ADMIN_TEXT.saved,
        ),
        error: t(ADMIN_TEXT.failed),
      },
    );
  };
  return (
    <div className="-mx-(--admin-content-padding) flex flex-wrap gap-2 border-t border-border px-(--admin-content-padding) pt-4">
      {course.status === "PUBLISHED" ? (
        <Button
          size="sm"
          type="button"
          variant="outline"
          disabled={action.isPending}
          onClick={() => run("unpublish")}
        >
          {t(ADMIN_TEXT.unpublish)}
        </Button>
      ) : (
        course.status === "DRAFT" && (
          <Button
            size="sm"
            type="button"
            disabled={
              action.isPending || !course.can_publish || publishDisabled
            }
            onClick={() => run("publish")}
          >
            {t(ADMIN_TEXT.publish)}
          </Button>
        )
      )}
      <Button
        size="sm"
        type="button"
        variant="outline"
        disabled={action.isPending}
        onClick={() => run("duplicate")}
      >
        {t(ADMIN_TEXT.duplicate)}
      </Button>
      {course.status !== "ARCHIVED" && (
        <Dialog open={archiveOpen} onOpenChange={setArchiveOpen}>
          <DialogTrigger asChild>
            <Button size="sm" type="button" variant="destructive">
              {t(ADMIN_TEXT.archive)}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-lg font-normal">
                {t(ADMIN_TEXT.archive)}
              </DialogTitle>
              <DialogDescription>
                {t(ADMIN_TEXT.archiveConfirm)}
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
                disabled={action.isPending}
                onClick={() => run("archive")}
              >
                {t(ADMIN_TEXT.archive)}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
