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
  Label,
} from "arxatec-ui";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { NS } from "@/locales/namespaces";
import { AdminSection } from "@/modules/admin/components/admin_section";
import { useDeleteNoticeSubscriber } from "@/modules/admin/hooks/notifications";
import { ADMIN_TEXT, NOTICES_TEXT } from "@/modules/admin/i18n";

export const DeleteSubscriberForm = () => {
  const { t } = useTranslation(NS.common);
  const [email, setEmail] = useState("");
  const [open, setOpen] = useState(false);
  const remove = useDeleteNoticeSubscriber();
  const submit = () => {
    void toast.promise(
      remove.mutateAsync(email.trim()).then(() => {
        setEmail("");
        setOpen(false);
      }),
      {
        loading: t(NOTICES_TEXT.delete),
        success: t(ADMIN_TEXT.saved),
        error: t(ADMIN_TEXT.failed),
      },
    );
  };
  return (
    <AdminSection title={t(NOTICES_TEXT.delete)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <Label htmlFor="subscriber-email">{t(NOTICES_TEXT.email)}</Label>
          <Input
            size="sm"
            id="subscriber-email"
            placeholder={t(NOTICES_TEXT.email)}
            type="email"
            className="mt-1.5"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              type="button"
              variant="destructive"
              disabled={!email.trim()}
            >
              {t(NOTICES_TEXT.delete)}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-lg font-normal">
                {t(NOTICES_TEXT.delete)}
              </DialogTitle>
              <DialogDescription>
                {t(NOTICES_TEXT.deleteConfirm)}
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
                onClick={submit}
              >
                {t(NOTICES_TEXT.delete)}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminSection>
  );
};
