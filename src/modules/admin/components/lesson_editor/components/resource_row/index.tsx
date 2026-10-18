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
  Input,
} from "arxatec-ui";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { NS } from "@/locales/namespaces";
import {
  useDeleteAdminResource,
  useUpdateAdminResource,
} from "@/modules/admin/hooks/lessons";
import { ADMIN_TEXT } from "@/modules/admin/i18n";
import type { AdminResource } from "@/modules/admin/types/lessons";

interface Props {
  resource: AdminResource;
  lessonId: string;
  index: number;
  total: number;
  onMove: (offset: number) => void;
  onDirtyChange: (dirty: boolean) => void;
}

export const ResourceRow = ({
  resource,
  lessonId,
  index,
  total,
  onMove,
  onDirtyChange,
}: Props) => {
  const { t } = useTranslation(NS.common);
  const [title, setTitle] = useState(resource.title);
  const [open, setOpen] = useState(false);
  const update = useUpdateAdminResource(lessonId);
  const remove = useDeleteAdminResource(lessonId);
  const save = () => {
    void toast.promise(
      update
        .mutateAsync({ id: resource.id, title: title.trim() })
        .then((saved) => {
          setTitle(saved.title);
          onDirtyChange(false);
        }),
      {
        loading: t(ADMIN_TEXT.save),
        success: t(ADMIN_TEXT.saved),
        error: t(ADMIN_TEXT.failed),
      },
    );
  };
  const deleteOne = () => {
    void toast.promise(
      remove.mutateAsync(resource.id).then(() => {
        setOpen(false);
        onDirtyChange(false);
      }),
      {
        loading: t(ADMIN_TEXT.remove),
        success: t(ADMIN_TEXT.saved),
        error: t(ADMIN_TEXT.failed),
      },
    );
  };
  return (
    <li className="flex min-w-0 flex-wrap items-center gap-2 px-(--admin-content-padding) py-3">
      <Input
        size="sm"
        aria-label={t(ADMIN_TEXT.resourceTitle)}
        placeholder={t(ADMIN_TEXT.resourceTitle)}
        className="w-full min-w-0 sm:w-auto sm:flex-1"
        value={title}
        disabled={update.isPending || remove.isPending}
        onChange={(event) => {
          setTitle(event.target.value);
          onDirtyChange(event.target.value !== resource.title);
        }}
      />
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={!title.trim() || update.isPending}
        onClick={save}
      >
        {t(ADMIN_TEXT.save)}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="size-8 p-0 text-muted-foreground"
        aria-label={`${t(ADMIN_TEXT.moveUp)}: ${resource.title}`}
        title={t(ADMIN_TEXT.moveUp)}
        disabled={index === 0}
        onClick={() => onMove(-1)}
      >
        <ArrowUp aria-hidden="true" className="size-4" />
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="size-8 p-0 text-muted-foreground"
        aria-label={`${t(ADMIN_TEXT.moveDown)}: ${resource.title}`}
        title={t(ADMIN_TEXT.moveDown)}
        disabled={index === total - 1}
        onClick={() => onMove(1)}
      >
        <ArrowDown aria-hidden="true" className="size-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button type="button" size="sm" variant="destructive">
            {t(ADMIN_TEXT.remove)}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg font-normal">
              {t(ADMIN_TEXT.remove)}
            </DialogTitle>
            <DialogDescription>
              {t(ADMIN_TEXT.resourceDeleteConfirm)}
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
              onClick={deleteOne}
            >
              {t(ADMIN_TEXT.remove)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </li>
  );
};
