import type { Lesson } from "@/modules/catalog/types";

export const getVideoUrls = (video: NonNullable<Lesson["video"]>) => {
  const id = encodeURIComponent(video.externalId);
  return video.provider === "YOUTUBE"
    ? {
        embed: `https://www.youtube-nocookie.com/embed/${id}`,
        external: `https://www.youtube.com/watch?v=${id}`,
      }
    : {
        embed: `https://player.vimeo.com/video/${id}`,
        external: `https://vimeo.com/${id}`,
      };
};
