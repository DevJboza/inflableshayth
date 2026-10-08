export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex items-center justify-between gap-4 mb-7">
      <div>
        <h1 className="page-title">{title}</h1>
        <p className="muted mt-1 text-sm">{subtitle}</p>
      </div>
      {action}
    </header>
  );
}
