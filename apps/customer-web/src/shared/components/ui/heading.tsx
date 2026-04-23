export function Heading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div>
      <h2 className="text-3xl font-bold text-primary">{title}</h2>
      {subtitle && (
        <p className="text-muted mt-2">{subtitle}</p>
      )}
    </div>
  );
}