import { Card, CardContent, CardFooter, CardHeader, Isotype } from "arxatec-ui";
import type { ReactNode } from "react";

import { cn } from "@/utilities/cn";

export interface AuthCardProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export const AuthCard = ({ title, subtitle, children, footer, className }: AuthCardProps) => (
  <Card className={cn("w-full max-w-[420px] gap-5 py-6", className)}>
    <CardHeader className="flex flex-col items-center gap-2 px-6 text-center">
      <Isotype className="size-7 text-foreground" />
      <h1 className="text-xl leading-tight font-medium text-foreground">{title}</h1>
      {subtitle === undefined ? null : (
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      )}
    </CardHeader>
    {children === undefined ? null : (
      <CardContent className="flex flex-col gap-4 px-6">{children}</CardContent>
    )}
    {footer === undefined ? null : (
      <CardFooter className="justify-center px-6 pt-0 text-sm text-muted-foreground">
        {footer}
      </CardFooter>
    )}
  </Card>
);
