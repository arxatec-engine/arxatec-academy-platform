import { Link } from "react-router-dom";

export interface AuthFooterLinkProps {
  question?: string;
  label: string;
  to: string;
}

export const AuthFooterLink = ({ question, label, to }: AuthFooterLinkProps) => (
  <p className="text-sm text-muted-foreground">
    {question === undefined ? null : <span>{question} </span>}
    <Link
      to={to}
      className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      {label}
    </Link>
  </p>
);
