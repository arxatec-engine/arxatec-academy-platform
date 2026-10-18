import { Button, Input, Label } from "arxatec-ui";
import { useId, useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { NS } from "@/locales/namespaces";
import { useSaveProfile } from "@/modules/profile/hooks";
import { PROFILE_TEXT } from "@/modules/profile/i18n";
import type { ApiUser } from "@/types/auth";
import { AvatarForm } from "../avatar_form";

interface Props {
  user: ApiUser;
  children: (form: ReactNode, saveButton: ReactNode) => ReactNode;
}

export const ProfileForm = ({ user, children }: Props) => {
  const formId = useId();
  const { t } = useTranslation(NS.common);
  const update = useSaveProfile();
  const [fullName, setFullName] = useState(user.full_name);
  const [avatar, setAvatar] = useState<File>();
  const [pickerVersion, setPickerVersion] = useState(0);
  const hasChanges =
    fullName.trim() !== user.full_name.trim() || avatar !== undefined;
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (update.isPending || !hasChanges) return;
    const full_name = fullName.trim();
    if (!full_name) {
      toast.error(t(PROFILE_TEXT.validation));
      return;
    }
    void toast.promise(
      update.mutateAsync({ full_name, avatar }).then((savedUser) => {
        setFullName(savedUser.full_name);
        setAvatar(undefined);
        setPickerVersion((version) => version + 1);
      }),
      {
        loading: t(PROFILE_TEXT.save),
        success: t(PROFILE_TEXT.saved),
        error: t(PROFILE_TEXT.failed),
      },
    );
  };
  return children(
    <form id={formId} onSubmit={submit}>
      <fieldset disabled={update.isPending} className="min-w-0 space-y-6">
        <AvatarForm
          key={pickerVersion}
          fullName={fullName}
          avatarUrl={user.avatar_url}
          onAvatarChange={setAvatar}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="profile-name">{t(PROFILE_TEXT.fullName)}</Label>
            <Input
              size="sm"
              id="profile-name"
              placeholder={t(PROFILE_TEXT.fullName)}
              className="mt-2"
              value={fullName}
              maxLength={120}
              required
              onChange={(event) => setFullName(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="profile-email">{t(PROFILE_TEXT.email)}</Label>
            <Input
              size="sm"
              id="profile-email"
              placeholder={t(PROFILE_TEXT.email)}
              className="mt-2"
              value={user.email}
              readOnly
              disabled
            />
          </div>
        </div>
      </fieldset>
    </form>,
    hasChanges ? (
      <Button
        size="sm"
        type="submit"
        form={formId}
        className="w-fit"
        disabled={update.isPending}
      >
        {t(PROFILE_TEXT.save)}
      </Button>
    ) : null,
  );
};
