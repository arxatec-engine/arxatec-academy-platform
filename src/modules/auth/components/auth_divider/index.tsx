export interface AuthDividerProps {
  label: string;
}

export const AuthDivider = ({ label }: AuthDividerProps) => (
  <div className="flex items-center gap-3" aria-hidden="true">
    <span className="h-px flex-1 bg-border" />
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className="h-px flex-1 bg-border" />
  </div>
);
