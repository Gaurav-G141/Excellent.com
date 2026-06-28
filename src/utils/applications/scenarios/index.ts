/**
 * Registry of all multi-step scenario problems, grouped by lesson in course
 * order. Mirrors the shape of APPLICATION_LESSONS (lessonId + topics) so the
 * Applications tab's unlock gating, recency picker, and the Practice review panel
 * all keep working by keying off lessonId + topicId.
 */

import { lesson1Scenarios } from './lesson1'
import { lesson2Scenarios } from './lesson2'
import { lesson3Scenarios } from './lesson3'
import { lesson4Scenarios } from './lesson4'
import type { ScenarioLessonGroup } from '../scenarioTypes'

export const SCENARIO_LESSONS: ScenarioLessonGroup[] = [
  lesson1Scenarios,
  lesson2Scenarios,
  lesson3Scenarios,
  lesson4Scenarios,
].filter((group) => group.topics.length > 0)

/**
 * The lesson a learner must complete before the Applications tab unlocks. Gating
 * starts at "Rules of Derivatives" (the power rule, taught in lesson 2) so no
 * scenario is ever served before its underlying rule has been taught. Both the
 * tab (TabNav) and the page (ApplicationsPage) key off this so they always agree.
 */
export const APPLICATIONS_UNLOCK_LESSON = 'derivative-rules'
