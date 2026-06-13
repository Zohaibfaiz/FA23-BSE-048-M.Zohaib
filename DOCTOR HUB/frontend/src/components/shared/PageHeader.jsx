export const PageHeader = ({ label, title, description }) => (
  <header className="mb-8">
    {label && <p className="section-label mb-2">{label}</p>}
    <h1 className="page-title">{title}</h1>
    {description && <p className="mt-2 max-w-2xl text-muted">{description}</p>}
    <div className="ornament-line mt-4">
      <span>◆</span>
    </div>
  </header>
);
