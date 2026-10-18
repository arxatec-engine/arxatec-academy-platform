import { Card } from "arxatec-ui";
import { useState } from "react";
import { DeleteSubscriberForm } from "../delete_subscriber_form";
import { MarkNoticesForm } from "../mark_notices_form";
import { SignupList } from "../signup_list";
import { TopicRequests } from "../topic_requests";

export const NotificationsContent = () => {
  const [exportCutoff, setExportCutoff] = useState<string | null>(null);
  return (
    <Card className="gap-0 divide-y divide-border overflow-hidden rounded-md py-0 shadow-none">
      <SignupList onExported={setExportCutoff} />
      <MarkNoticesForm cutoff={exportCutoff} />
      <TopicRequests />
      <DeleteSubscriberForm />
    </Card>
  );
};
