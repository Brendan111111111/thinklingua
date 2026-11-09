import { CourseMap } from "@/components/CourseViews";

export default async function CoursePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <CourseMap courseId={lang} />;
}
