import type { ProblemSlide } from '../../types/lesson'

/** A single practice topic: one concept, regenerated with fresh numbers. */
export interface PracticeTopicDef {
  /** Unique id across all lessons, e.g. "l2-power". */
  id: string
  /** Short chip label, e.g. "Power rule". */
  label: string
  /**
   * Build one problem with a fresh random polynomial. Called every time the
   * learner asks for a new problem, so it must return a self-contained,
   * well-posed ProblemSlide that the matching slide component can render+grade.
   */
  generate: () => ProblemSlide
}

/** All practice topics belonging to one lesson. */
export interface PracticeLessonGroup {
  lessonId: string
  lessonTitle: string
  topics: PracticeTopicDef[]
}
