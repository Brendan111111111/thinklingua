import { LessonRunner } from "@/components/LessonRunner";

export default async function LessonPage({ params }: { params: Promise<{ lang: string; lessonId: string }> }) {
  const { lang, lessonId } = await params;
  return <LessonRunner courseId={lang} lessonId={lessonId} />;
}
