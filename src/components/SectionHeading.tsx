type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  titleId?: string;
  description?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  titleId,
  description,
}: SectionHeadingProps) {
  return (
    <header className="section-heading">
      <p className="section-eyebrow">{eyebrow}</p>
      <h2 className="section-title" id={titleId}>
        {title}
      </h2>
      {description ? (
        <p className="section-description">{description}</p>
      ) : null}
    </header>
  );
}
