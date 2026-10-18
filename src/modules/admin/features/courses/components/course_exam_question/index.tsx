import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Button,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
  Textarea,
} from "arxatec-ui";
import { useId } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NS } from "@/locales/namespaces";
import { EXAM_RULES } from "@/modules/progress/constants/exams";
import { EXAM_TEXT } from "@/modules/progress/i18n/exams";
import type { ExamQuestion } from "@/modules/progress/types/exams";
import { cn } from "@/utilities/cn";

interface Props {
  question: ExamQuestion;
  index: number;
  disabled: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (question: ExamQuestion) => void;
}
export const CourseExamQuestion = ({
  question,
  index,
  disabled,
  open,
  onOpenChange,
  onChange,
}: Props) => {
  const { t } = useTranslation(NS.common);
  const id = useId();
  const number = index + 1;
  return (
    <Collapsible
      open={open}
      onOpenChange={onOpenChange}
      className="rounded-md border border-border"
      data-exam-question={index}
    >
      <CollapsibleTrigger asChild>
        <Button
          size="sm"
          type="button"
          variant="ghost"
          disabled={disabled}
          className="w-full justify-between"
        >
          {t(EXAM_TEXT.question, { number })}
          <ChevronDown
            aria-hidden="true"
            className={cn("size-4", open && "rotate-180")}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3 border-t border-border p-3">
        <div className="space-y-1">
          <Label htmlFor={`${id}-text`}>
            {t(EXAM_TEXT.questionText, { number })}
          </Label>
          <Textarea
            id={`${id}-text`}
            value={question.text}
            placeholder={t(EXAM_TEXT.questionPlaceholder)}
            maxLength={EXAM_RULES.questionMaxLength}
            className="text-sm"
            onChange={(event) =>
              onChange({ ...question, text: event.target.value })
            }
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {question.options.map((option, optionIndex) => {
            const letter = String.fromCharCode(65 + optionIndex);
            return (
              <div key={optionIndex} className="space-y-1">
                <Label htmlFor={`${id}-option-${optionIndex}`}>
                  {t(EXAM_TEXT.option, { number, letter })}
                </Label>
                <Input
                  id={`${id}-option-${optionIndex}`}
                  size="sm"
                  value={option}
                  placeholder={t(EXAM_TEXT.optionPlaceholder, { letter })}
                  maxLength={EXAM_RULES.optionMaxLength}
                  onChange={(event) =>
                    onChange({
                      ...question,
                      options: question.options.map((value, position) =>
                        position === optionIndex ? event.target.value : value,
                      ),
                    })
                  }
                />
              </div>
            );
          })}
        </div>
        <div className="space-y-1">
          <p id={`${id}-correct`} className="text-sm">
            {t(EXAM_TEXT.correctOption, { number })}
          </p>
          <RadioGroup
            aria-labelledby={`${id}-correct`}
            disabled={disabled}
            className="flex flex-wrap gap-2"
            value={
              question.correct_option < 0 ? "" : String(question.correct_option)
            }
            onValueChange={(value) =>
              onChange({ ...question, correct_option: Number(value) })
            }
          >
            {question.options.map((_, optionIndex) => (
              <Button
                key={optionIndex}
                asChild
                variant="outline"
                size="sm"
                className={cn(
                  "gap-2",
                  question.correct_option === optionIndex &&
                    "border-foreground bg-muted",
                )}
              >
                <Label htmlFor={`${id}-correct-${optionIndex}`}>
                  <RadioGroupItem
                    id={`${id}-correct-${optionIndex}`}
                    value={String(optionIndex)}
                  />
                  {String.fromCharCode(65 + optionIndex)}
                </Label>
              </Button>
            ))}
          </RadioGroup>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
