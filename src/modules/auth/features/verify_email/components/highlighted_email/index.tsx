import { Fragment } from "react";

export interface HighlightedEmailProps {
  text: string;
  email: string;
}

export const HighlightedEmail = ({ text, email }: HighlightedEmailProps) => {
  const parts = email.length > 0 ? text.split(email) : [text];

  return (
    <>
      {parts.map((part, index) => (
        <Fragment key={`${String(index)}:${part}`}>
          {index === 0 ? null : (
            <strong className="font-normal text-foreground">{email}</strong>
          )}
          {part}
        </Fragment>
      ))}
    </>
  );
};
