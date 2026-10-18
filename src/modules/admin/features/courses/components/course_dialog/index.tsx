import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  ScrollArea,
} from "arxatec-ui";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { UI_TEXT } from "@/components/shared/i18n";
import { PAGE_TITLE_TEXT } from "@/constants/page_title";
import { NS } from "@/locales/namespaces";
import { ADMIN_TEXT } from "@/modules/admin/i18n";
import { useCourseDialog } from "../../hooks/use_course_dialog";
import { COURSE_SETUP_TEXT } from "../../i18n/course_setup";
import { CourseEditor } from "../course_editor";
import { CreateCourseForm } from "../create_course_form";

export const CourseDialog = ({ courseId }: { courseId?: string }) => {
  const { t } = useTranslation(NS.common);
  const {
    isSaving,
    requestClose,
    confirmationOpen,
    cancelClose,
    confirmClose,
  } = useCourseDialog();

  return (
    <>
      <Dialog
        open
        onOpenChange={(open) => {
          if (!open) requestClose();
        }}
      >
        <DialogContent
          showCloseButton={false}
          aria-describedby={undefined}
          className="flex max-h-[calc(100svh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl"
          onEscapeKeyDown={(event) => {
            if (isSaving) event.preventDefault();
          }}
        >
          <DialogHeader className="sr-only">
            <DialogTitle className="text-xl font-normal">
              {t(courseId ? PAGE_TITLE_TEXT.editCourse : ADMIN_TEXT.create)}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="min-h-0 w-full [&>[data-slot=scroll-area-viewport]]:max-h-[calc(100svh-2rem-2px)] [&>[data-slot=scroll-area-viewport]]:overscroll-contain">
            <div className="min-w-0 p-(--admin-content-padding) [--admin-content-padding:1rem] sm:[--admin-content-padding:1.5rem]">
              {courseId ? <CourseEditor /> : <CreateCourseForm />}
            </div>
          </ScrollArea>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="absolute top-3 right-3 size-8 p-0"
            aria-label={t(UI_TEXT.close)}
            title={t(UI_TEXT.close)}
            disabled={isSaving}
            onClick={requestClose}
          >
            <X aria-hidden="true" className="size-4" />
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog
        open={confirmationOpen}
        onOpenChange={(open) => {
          if (!open) cancelClose();
        }}
      >
        <DialogContent
          role="alertdialog"
          showCloseButton={false}
          onPointerDownOutside={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-normal">
              {t(COURSE_SETUP_TEXT.closeTitle)}
            </DialogTitle>
            <DialogDescription>
              {t(COURSE_SETUP_TEXT.closeHint)}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              size="sm"
              type="button"
              variant="outline"
              onClick={cancelClose}
            >
              {t(COURSE_SETUP_TEXT.keepEditing)}
            </Button>
            <Button
              size="sm"
              type="button"
              disabled={isSaving}
              onClick={confirmClose}
            >
              {t(COURSE_SETUP_TEXT.confirmClose)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
