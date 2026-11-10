import { PlacementTest } from "@/components/PlacementTest";

export default async function PlacementPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <PlacementTest courseId={lang} />;
}
