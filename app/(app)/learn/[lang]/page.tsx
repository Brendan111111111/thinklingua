import { CourseMap } from "@/components/CourseViews";

export default async function CoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ track?: string | string[] }>;
}) {
  const [{ lang }, query] = await Promise.all([params, searchParams]);
  const requestedTrack = Array.isArray(query.track) ? query.track[0] : query.track;
  const initialTrack = requestedTrack === "read" || requestedTrack === "speak" ? requestedTrack : "words";

  return <CourseMap courseId={lang} initialTrack={initialTrack} />;
}
