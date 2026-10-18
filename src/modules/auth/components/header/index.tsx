interface Props {
  title: string;
  description?: string;
}

export const Header = ({ title, description }: Props) => (
  <div>
    <h1 className="text-base text-left">{title}</h1>
    {description === undefined ? null : (
      <p className="text-sm text-muted-foreground text-left">{description}</p>
    )}
  </div>
);
