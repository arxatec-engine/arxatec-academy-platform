import { AvatarInput } from "arxatec-ui";
import { useTranslation } from "react-i18next";
import { NS } from "@/locales/namespaces";
import { PROFILE_TEXT } from "@/modules/profile/i18n";

interface Props {
  fullName: string;
  avatarUrl: string | null;
  onAvatarChange: (file: File) => void;
}

export const AvatarForm = ({ fullName, avatarUrl, onAvatarChange }: Props) => {
  const { t } = useTranslation(NS.common);
  return (
    <AvatarInput
      fullName={fullName}
      defaultAvatar={avatarUrl ?? undefined}
      label=""
      className="[&>label]:hidden [&>div]:mt-0 [&_[data-slot=avatar-input-preview]>button]:hidden"
      labels={{
        optional: "",
        add: t(PROFILE_TEXT.avatarSelect),
        change: t(PROFILE_TEXT.avatarSelect),
        remove: t(PROFILE_TEXT.avatarDelete),
        previewAlt: t(PROFILE_TEXT.avatarPreview),
        invalidType: t(PROFILE_TEXT.avatarInvalidType),
        tooLarge: t(PROFILE_TEXT.avatarTooLarge),
      }}
      onAvatarChange={(file) => {
        if (file) onAvatarChange(file);
      }}
    />
  );
};
