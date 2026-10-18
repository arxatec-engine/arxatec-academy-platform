import { Card, CardContent } from "arxatec-ui";
import type { Lesson } from "@/modules/catalog/types";
import { LessonTranscript } from "../lesson_transcript";
import { LessonVideo } from "../lesson_video";

interface Props {
  lesson: Lesson;
}

export const LessonMaterial = ({ lesson }: Props) => (
  <>
    {lesson.type === "VIDEO" && <LessonVideo lesson={lesson} />}
    {lesson.type === "ARTICLE" && lesson.articleBody && (
      <Card className="mt-8 rounded-md py-0 shadow-none">
        <CardContent className="px-5 py-6 sm:px-10 sm:py-8">
          <article
            className="academy-article mx-auto max-w-3xl"
            dangerouslySetInnerHTML={{ __html: lesson.articleBody }}
          />
        </CardContent>
      </Card>
    )}
    {lesson.transcript && <LessonTranscript transcript={lesson.transcript} />}
  </>
);
