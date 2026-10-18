export interface AuthNoteProps {
  text: string;
}

export const AuthNote = ({ text }: AuthNoteProps) => (
  <p className="text-sm text-muted-foreground">{text}</p>
);
