import { INTERVENTION_LEVELS } from '../utils/constants.js';

/**
 * Evaluates operational signals to determine the appropriate intervention level.
 *
 * ARCHITECTURAL INCONSISTENCY RESOLUTION:
 * In BACKEND_ARCHITECTURE.md pseudocode, the branch `historicalMistakesInTopic === 1 && selfConfidenceRating <= 2`
 * was positioned after `historicalMistakesInTopic === 1`, making it unreachable.
 *
 * Resolved Ordering:
 * 1. 0 mistakes -> Level 1 (NONE)
 * 2. >= 3 mistakes -> Level 4 (GUIDED_RETRY)
 * 3. >= 2 mistakes OR (1 mistake with low confidence <= 2) -> Level 3 (MICRO_TUTORIAL)
 * 4. 1 mistake with moderate/high confidence (> 2) -> Level 2 (CONTEXTUAL_EXPLANATION)
 */
export function determineInterventionLevel({
  historicalMistakesInTopic = 0,
  selfConfidenceRating = 3,
  hintsUsed = 0,
  attemptCount = 1,
}) {
  if (historicalMistakesInTopic === 0) {
    return {
      level: INTERVENTION_LEVELS.LEVEL_1_NONE,
      type: 'NONE',
    };
  }

  // Critical pattern failure: 3 or more mistakes in topic
  if (historicalMistakesInTopic >= 3 || attemptCount >= 4) {
    return {
      level: INTERVENTION_LEVELS.LEVEL_4_GUIDED_RETRY,
      type: 'GUIDED_RETRY',
    };
  }

  // Accelerated intervention: 2 mistakes OR early struggle (1 mistake with low self-confidence <= 2)
  if (historicalMistakesInTopic >= 2 || (historicalMistakesInTopic === 1 && selfConfidenceRating <= 2)) {
    return {
      level: INTERVENTION_LEVELS.LEVEL_3_MICRO_TUTORIAL,
      type: 'MICRO_TUTORIAL',
    };
  }

  // Isolated first mistake with normal/high confidence
  return {
    level: INTERVENTION_LEVELS.LEVEL_2_CONTEXTUAL_EXPLANATION,
    type: 'CONTEXTUAL_EXPLANATION',
  };
}

/**
 * Builds the authoritative 5-part educational debrief payload.
 *
 * Required 5-part structure:
 * 1. whatHappened
 * 2. evidence
 * 3. whyDangerous
 * 4. correctAction
 * 5. securityTip
 */
export function buildEducationalPayload({
  explanation = {},
  topic,
  difficulty = 'beginner',
  historicalMistakes = 0,
  selfConfidenceRating = 3,
  hintsUsed = 0,
  attemptCount = 1,
}) {
  const intervention = determineInterventionLevel({
    historicalMistakesInTopic: historicalMistakes,
    selfConfidenceRating,
    hintsUsed,
    attemptCount,
  });

  if (intervention.level === INTERVENTION_LEVELS.LEVEL_1_NONE) {
    return {
      level: intervention.level,
      type: intervention.type,
      payload: null,
      context: {
        topic,
        difficulty,
        historicalMistakes,
        selfConfidenceRating,
        overconfidenceDetected: false,
      },
    };
  }

  // Check for overconfidence signal: High self-confidence (>= 4) combined with repeated mistakes (>= 2)
  const overconfidenceDetected = selfConfidenceRating >= 4 && historicalMistakes >= 2;

  return {
    level: intervention.level,
    type: intervention.type,
    payload: {
      whatHappened: explanation.whatHappened || 'A security misstep was detected during investigation.',
      evidence: explanation.evidence || 'Anomalies in communication headers or indicators of compromise were overlooked.',
      whyDangerous: explanation.whyDangerous || 'This action exposes facility subnets to unauthorized penetration.',
      correctAction: explanation.correctAction || 'Quarantine unverified artifacts and perform independent verification.',
      securityTip: explanation.securityTip || 'Always verify root sender domains before interacting with high-stakes messages.',
    },
    context: {
      topic,
      difficulty,
      historicalMistakes,
      hintsUsed,
      selfConfidenceRating,
      overconfidenceDetected,
    },
  };
}
