import { Card, CardContent } from "arxatec-ui";
import { useUserStore } from "@/store/user";
import { PersonalizationSettings } from "../personalization_settings";
import { ProfileAccountActions } from "../profile_account_actions";
import { ProfileForm } from "../profile_form";
import { ProfileSummary } from "../profile_summary";

export const ProfileContent = () => {
  const user = useUserStore((state) => state.user);
  if (!user) return null;
  return (
    <ProfileForm user={user}>
      {(form, saveButton) => (
        <div className="grid items-start gap-2">
          <Card className="gap-0 rounded-md py-3 shadow-none">
            <CardContent className="space-y-4 px-3">
              {form}
              <PersonalizationSettings />
            </CardContent>
          </Card>
          <ProfileSummary />
          <div className="flex flex-wrap items-center justify-end gap-2">
            <ProfileAccountActions user={user} />
            {saveButton}
          </div>
        </div>
      )}
    </ProfileForm>
  );
};
