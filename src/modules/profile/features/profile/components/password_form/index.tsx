import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Label,
} from "arxatec-ui";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { UI_TEXT } from "@/components/shared/i18n";
import { PasswordInput } from "@/components/shared/password_input";
import { NS } from "@/locales/namespaces";
import { useUpdatePassword } from "@/modules/profile/hooks";
import { PROFILE_TEXT } from "@/modules/profile/i18n";

interface Props {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCloseAutoFocus?: React.ComponentProps<typeof DialogContent>["onCloseAutoFocus"];
}

export const PasswordForm = ({
  open: controlledOpen,
  onOpenChange,
  onCloseAutoFocus,
}: Props = {}) => {
  const { t } = useTranslation(NS.common);
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = (nextOpen: boolean) => {
    if (controlledOpen === undefined) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const update = useUpdatePassword();
  const hasChanges = currentPassword.length > 0 || newPassword.length > 0;
  const changeOpen = (nextOpen: boolean) => {
    if (update.isPending) return;
    setOpen(nextOpen);
    if (!nextOpen) {
      setCurrentPassword("");
      setNewPassword("");
    }
  };
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (update.isPending || !hasChanges) return;
    void toast.promise(
      update
        .mutateAsync({
          current_password: currentPassword,
          new_password: newPassword,
        })
        .then(() => {
          setCurrentPassword("");
          setNewPassword("");
          setOpen(false);
        }),
      {
        loading: t(PROFILE_TEXT.save),
        success: t(PROFILE_TEXT.passwordSaved),
        error: t(PROFILE_TEXT.failed),
      },
    );
  };
  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      {controlledOpen === undefined && (
        <DialogTrigger asChild>
          <Button size="sm" type="button" variant="outline">
            {t(PROFILE_TEXT.changePassword)}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        onCloseAutoFocus={onCloseAutoFocus}
        className="max-h-[calc(100svh-2rem)] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="text-base">
            {t(PROFILE_TEXT.changePassword)}
          </DialogTitle>
        </DialogHeader>
        <form className="space-y-5" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="profile-current-password">
              {t(PROFILE_TEXT.currentPassword)}
            </Label>
            <PasswordInput
              size="sm"
              id="profile-current-password"
              placeholder={t(PROFILE_TEXT.currentPassword)}
              autoComplete="current-password"
              value={currentPassword}
              required
              onChange={(event) => setCurrentPassword(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-new-password">
              {t(PROFILE_TEXT.newPassword)}
            </Label>
            <PasswordInput
              size="sm"
              id="profile-new-password"
              placeholder={t(PROFILE_TEXT.newPassword)}
              autoComplete="new-password"
              value={newPassword}
              required
              minLength={8}
              onChange={(event) => setNewPassword(event.target.value)}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                size="sm"
                type="button"
                variant="outline"
                disabled={update.isPending}
              >
                {t(UI_TEXT.close)}
              </Button>
            </DialogClose>
            {hasChanges && (
              <Button
                size="sm"
                type="submit"
                disabled={update.isPending}
                aria-busy={update.isPending}
              >
                {t(PROFILE_TEXT.save)}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
