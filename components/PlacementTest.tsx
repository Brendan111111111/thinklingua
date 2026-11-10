"use client";

import Link from "next/link";
import { useState } from "react";
import { getCourse, scriptClass } from "@/lib/content";
import { placementTests } from "@/lib/content/placement";
import { placeAtIntermediate, useProgress } from "@/lib/progress";
import { Badge, Icon, ProgressBar, cn } from "./ui";

export function PlacementTest({ courseId }: { courseId: string }) {
  const course = getCourse(courseId);
  const { progress } = useProgress();
  const test = course ? placementTests[course.id] : undefined;
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);

  if (!course || !test) {
    return (
      <div className="card mx-auto max-w-xl p-8 text-center">
        <p>Placement tests are available for all four courses.</p>
        <Link href="/learn" className="btn btn-primary mt-5 px-6 py-3">
          All courses
        </Link>
      </div>
    );
  }

  const beginnerUnits = course.units.slice(0, 4);
  const beginnerLessonIds = beginnerUnits.flatMap((unit) => unit.lessons.map((lesson) => lesson.id));
  const answered = Object.keys(answers).length;
  const firstIntermediate = course.units[4]?.lessons[0];
  const previous = progress.placement?.[course.id];

  function choose(questionIndex: number, optionIndex: number) {
    if (result) return;
    setAnswers((current) => ({ ...current, [questionIndex]: optionIndex }));
  }

  function submit() {
    if (!course || !test || answered !== test.questions.length || result) return;
    const score = test.questions.reduce((total, question, index) => total + (answers[index] === question.answer ? 1 : 0), 0);
    const passed = score >= test.passScore;
    if (passed) placeAtIntermediate(course.id, beginnerLessonIds, score);
    setResult({ score, passed });
  }

  function retry() {
    setAnswers({});
    setResult(null);
  }

  if (result) {
    return (
      <div className="mx-auto max-w-3xl">
        <Link href={`/learn/${course.id}`} className="inline-flex items-center gap-2 text-xs text-muted transition hover:text-cream">
          <Icon name="arrow" className="h-3.5 w-3.5 rotate-180" />
          Back to {course.name}
        </Link>

        <div className={cn("card mt-4 overflow-hidden p-6 sm:p-8", result.passed ? "border-jade/40" : "border-sakura/35")}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <Badge tone={result.passed ? "jade" : "sakura"}>{result.passed ? "placed" : "not yet"}</Badge>
              <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight">
                {result.passed ? "You can start at Unit 5." : "Keep building the beginner base."}
              </h1>
              <p className="mt-2 max-w-xl text-sm text-muted">
                {result.passed
                  ? "Your beginner Words units are marked complete, so the course map now points into the intermediate half. Speaking and reading remain independent tracks."
                  : `You scored ${result.score} of ${test.questions.length}. You need ${test.passScore} correct to place at Unit 5.`}
              </p>
            </div>
            <span className={cn("grid h-16 w-16 shrink-0 place-items-center rounded-3xl border text-xl font-semibold", result.passed ? "border-jade/40 bg-jade/10 text-jade" : "border-sakura/35 bg-sakura/10 text-sakura")}>
              {result.score}/{test.questions.length}
            </span>
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            {result.passed && firstIntermediate ? (
              <Link href={`/learn/${course.id}/${firstIntermediate.id}`} className="btn btn-primary px-6 py-3">
                Start Unit 5
                <Icon name="arrow" className="h-4 w-4" />
              </Link>
            ) : null}
            <Link href={`/learn/${course.id}`} className="btn btn-ghost px-6 py-3">
              View course map
            </Link>
            <button type="button" onClick={retry} className="btn btn-ghost px-6 py-3">
              {result.passed ? "Retake test" : "Try again"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={`/learn/${course.id}`} className="inline-flex items-center gap-2 text-xs text-muted transition hover:text-cream">
        <Icon name="arrow" className="h-3.5 w-3.5 rotate-180" />
        Back to {course.name}
      </Link>

      <header className="mt-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-2xl">{course.flag}</span>
          <Badge tone="violet">placement test</Badge>
          {previous ? <Badge tone="jade">previous score {previous.score}/{test.questions.length}</Badge> : null}
        </div>
        <h1 className={cn("mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl", scriptClass[course.id])}>
          Test into Unit 5
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Ten questions on the beginner Words units. Score {test.passScore} or more to mark Units 1–4 complete and start at the
          intermediate half. This does not change your speaking or reading progress.
        </p>
      </header>

      <div className="mt-5 flex items-center gap-3 rounded-2xl border border-line/70 bg-panel/40 px-4 py-3">
        <ProgressBar value={answered / test.questions.length} tone="violet" className="flex-1" />
        <span className="shrink-0 text-[11px] font-semibold text-muted">{answered}/{test.questions.length} answered</span>
      </div>

      <div className="mt-5 space-y-4">
        {test.questions.map((question, questionIndex) => {
          const chosen = answers[questionIndex];
          return (
            <section key={question.id} className="card p-5">
              <div className="flex items-start gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-line bg-ink/40 text-[11px] font-semibold text-muted">
                  {questionIndex + 1}
                </span>
                <p className={cn("pt-0.5 text-sm font-medium text-cream", scriptClass[course.id])}>{question.prompt}</p>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {question.options.map((option, optionIndex) => {
                  const selected = chosen === optionIndex;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => choose(questionIndex, optionIndex)}
                      className={cn(
                        "rounded-2xl border px-4 py-3 text-left text-sm transition",
                        scriptClass[course.id],
                        selected
                          ? "border-violet/60 bg-violet/10 text-cream"
                          : "border-line/80 bg-ink/20 text-muted hover:border-violet/40 hover:bg-panel2/60 hover:text-cream",
                      )}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted">
          {beginnerUnits.length} beginner units · {beginnerLessonIds.length} word lessons · pass at {test.passScore}/{test.questions.length}
        </p>
        <button type="button" onClick={submit} disabled={answered !== test.questions.length} className="btn btn-primary px-6 py-3">
          Check placement
          <Icon name="arrow" className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
