export default function ErrorScreen({ error }: { error: string | null }) {
  return <div className="p-3">{error}</div>;
}
