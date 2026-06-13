export default function PlaceholderPage({ title }) {
  return (
    <div className="glass p-12 text-center">
      <h1 className="font-heading text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-white/50">This section is wired to the API — extend in the next sprint.</p>
    </div>
  );
}
