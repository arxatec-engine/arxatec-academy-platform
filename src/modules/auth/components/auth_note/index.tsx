export interface AuthNoteProps {
  text: string;
}

export const AuthNote = ({ text }: AuthNoteProps) => (
  <p className="text-xs text-muted-foreground">{text}</p>
);
