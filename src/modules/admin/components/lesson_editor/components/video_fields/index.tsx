import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  StatusMessage,
} from "arxatec-ui";
import { CircleCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { NS } from "@/locales/namespaces";
import { useProbeAdminVideo } from "@/modules/admin/hooks/lessons";
import { ADMIN_TEXT } from "@/modules/admin/i18n";
import type { LessonDraft } from "@/modules/admin/types/lessons";
import type { VideoProvider } from "@/modules/catalog/types";

interface Props {
  id: string;
  draft: LessonDraft;
  onChange: (draft: LessonDraft) => void;
}

export const VideoFields = ({ id, draft, onChange }: Props) => {
  const { t } = useTranslation(NS.common);
  const probe = useProbeAdminVideo();
  const check = () => {
    void toast.promise(
      probe.mutateAsync({
        provider: draft.videoProvider,
        externalId: draft.videoId.trim(),
      }),
      {
        loading: t(ADMIN_TEXT.probe),
        success: t(ADMIN_TEXT.videoFound),
        error: t(ADMIN_TEXT.videoFailed),
      },
    );
  };
  return (
    <div className="-mx-(--admin-content-padding) grid gap-4 border-y border-border px-(--admin-content-padding) py-4 sm:grid-cols-2">
      <div className="min-w-0">
        <Label htmlFor={`${id}-video-provider`}>
          {t(ADMIN_TEXT.videoProvider)}
        </Label>
        <Select
          value={draft.videoProvider}
          onValueChange={(value: VideoProvider) =>
            onChange({ ...draft, videoProvider: value })
          }
        >
          <SelectTrigger
            size="sm"
            id={`${id}-video-provider`}
            className="mt-1.5 w-full min-w-0"
          >
            <SelectValue placeholder={t(ADMIN_TEXT.videoProvider)} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="YOUTUBE">{t(ADMIN_TEXT.youtube)}</SelectItem>
            <SelectItem value="VIMEO">{t(ADMIN_TEXT.vimeo)}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="min-w-0">
        <Label htmlFor={`${id}-video-id`}>{t(ADMIN_TEXT.videoId)}</Label>
        <Input
          size="sm"
          id={`${id}-video-id`}
          placeholder={t(ADMIN_TEXT.videoId)}
          className="mt-1.5"
          value={draft.videoId}
          onChange={(event) =>
            onChange({ ...draft, videoId: event.target.value })
          }
        />
      </div>
      {draft.videoProvider === "YOUTUBE" && (
        <div>
          <Label htmlFor={`${id}-video-duration`}>
            {t(ADMIN_TEXT.durationSeconds)}
          </Label>
          <Input
            size="sm"
            id={`${id}-video-duration`}
            placeholder={t(ADMIN_TEXT.durationSeconds)}
            type="number"
            min={1}
            className="mt-1.5"
            value={draft.durationSeconds}
            onChange={(event) =>
              onChange({ ...draft, durationSeconds: event.target.value })
            }
          />
        </div>
      )}
      <Button
        size="sm"
        type="button"
        variant="outline"
        className="self-end justify-self-start"
        disabled={probe.isPending || !draft.videoId.trim()}
        onClick={check}
      >
        {t(ADMIN_TEXT.probe)}
      </Button>
      {probe.data && (
        <div className="sm:col-span-2" role="status">
          <StatusMessage
            size="sm"
            color="white"
            icon={CircleCheck}
            title={t(ADMIN_TEXT.videoFound)}
            description={probe.data.title ?? t(ADMIN_TEXT.video)}
          />
        </div>
      )}
    </div>
  );
};
