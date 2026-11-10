"use client";

import Link from "next/link";
import { useRef } from "react";
import { LessonRunner } from "@/components/LessonRunner";
import { allCourseLessonIds, courses, getCourse, scriptClass } from "@/lib/content";
import { dueLexemes, useProgress } from "@/lib/progress";
import { Icon, cn } from "@/components/ui";

export default function ReviewPage() {
  const { progress, ready } = useProgress();
  const course = getCourse(progress.active) ?? courses[0];
  const dueRef = useRef<{ courseId: string; ids: string[] } | null>(null);

  if (!ready) {
    return <div className="card h-64 animate-pulse bg-panel/40" />;
  }

  const started = allCourseLessonIds(course).some((id) => progress.completed[id]);

  if (!started) {
    return (
      <div className="card mx-auto max-w-lg p-8 text-center">
        <span className="text-4xl">👂</span>
        <h1 className="mt-3 font-display text-2xl font-semibold">Nothing to review yet</h1>
        <p className="mt-2 text-sm text-muted">
          Finish a lesson in {course.english} and the words you meet will come back here on a spaced schedule, right before you
          would forget them.
        </p>
        <Link href={`/learn/${course.id}`} className="btn btn-primary mt-5 px-6 py-3">
          Open {course.english}
          <Icon name="arrow" className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  // Freeze the queue for this session so answering a card cannot shrink it mid-run.
  let dueSession = dueRef.current;
  if (!dueSession || dueSession.courseId !== course.id) {
    dueSession = { courseId: course.id, ids: dueLexemes(progress, Object.keys(course.lexemes)) };
    dueRef.current = dueSession;
  }
  const due = dueSession.ids;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-jade">Review</p>
          <h1 className="font-display text-2xl font-semibold">
            {due.length} word{due.length === 1 ? "" : "s"} due in <span className={scriptClass[course.id]}>{course.name}</span>
          </h1>
        </div>
        <div className="flex gap-1.5">
          {courses.map((option) => (
            <Link
              key={option.id}
              href={`/learn/${option.id}`}
              className={cn(
                "grid h-9 w-10 place-items-center rounded-lg border text-sm",
                option.id === course.id ? "border-jade/50 bg-jade/10" : "border-line/70 bg-panel/40 opacity-70",
              )}
            >
              {option.flag}
            </Link>
          ))}
        </div>
      </div>
      <LessonRunner courseId={course.id} mode="review" reviewLexemeIds={due} />
    </div>
  );
}
