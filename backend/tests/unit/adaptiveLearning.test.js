import { describe, it, expect } from 'vitest';
import {
  determineInterventionLevel,
  buildEducationalPayload,
} from '../../src/services/adaptiveLearningService.js';
import { INTERVENTION_LEVELS, TOPICS } from '../../src/utils/constants.js';

describe('Phase B5: Adaptive Learning Engine Unit Tests', () => {
  describe('Intervention Level Determination', () => {
    it('should return Level 1 (NONE) when player has made zero mistakes', () => {
      const result = determineInterventionLevel({
        historicalMistakesInTopic: 0,
        selfConfidenceRating: 4,
      });

      expect(result.level).toBe(INTERVENTION_LEVELS.LEVEL_1_NONE);
      expect(result.type).toBe('NONE');
    });

    it('should return Level 2 (CONTEXTUAL_EXPLANATION) on isolated first mistake with normal/high confidence', () => {
      const result = determineInterventionLevel({
        historicalMistakesInTopic: 1,
        selfConfidenceRating: 4, // High confidence cadet
      });

      expect(result.level).toBe(INTERVENTION_LEVELS.LEVEL_2_CONTEXTUAL_EXPLANATION);
      expect(result.type).toBe('CONTEXTUAL_EXPLANATION');
    });

    it('should accelerate to Level 3 (MICRO_TUTORIAL) on first mistake if player reported low confidence (<= 2)', () => {
      // Tests the resolved unreachable branch from BACKEND_ARCHITECTURE.md
      const result = determineInterventionLevel({
        historicalMistakesInTopic: 1,
        selfConfidenceRating: 2, // Low confidence cadet needing early tutorial help
      });

      expect(result.level).toBe(INTERVENTION_LEVELS.LEVEL_3_MICRO_TUTORIAL);
      expect(result.type).toBe('MICRO_TUTORIAL');
    });

    it('should return Level 3 (MICRO_TUTORIAL) on repeated mistakes (2 mistakes in topic)', () => {
      const result = determineInterventionLevel({
        historicalMistakesInTopic: 2,
        selfConfidenceRating: 4,
      });

      expect(result.level).toBe(INTERVENTION_LEVELS.LEVEL_3_MICRO_TUTORIAL);
      expect(result.type).toBe('MICRO_TUTORIAL');
    });

    it('should escalate to Level 4 (GUIDED_RETRY) on critical struggle (>= 3 mistakes)', () => {
      const result = determineInterventionLevel({
        historicalMistakesInTopic: 3,
        selfConfidenceRating: 3,
      });

      expect(result.level).toBe(INTERVENTION_LEVELS.LEVEL_4_GUIDED_RETRY);
      expect(result.type).toBe('GUIDED_RETRY');
    });

    it('should escalate to Level 4 (GUIDED_RETRY) when attempt count reaches 4 or higher', () => {
      const result = determineInterventionLevel({
        historicalMistakesInTopic: 2,
        attemptCount: 4,
      });

      expect(result.level).toBe(INTERVENTION_LEVELS.LEVEL_4_GUIDED_RETRY);
    });
  });

  describe('5-Part Educational Payload Construction', () => {
    const mockExplanation = {
      whatHappened: 'You clicked a suspicious hyperlink in an unverified email.',
      evidence: 'Domain was "micr0soft-update.com" with a digit zero instead of the letter O.',
      whyDangerous: 'Redirects to a credential harvester to capture admin credentials.',
      correctAction: 'Quarantine the email and submit a SOC incident report.',
      securityTip: 'Always inspect the domain name in the address bar before entering credentials.',
    };

    it('should construct a complete 5-part educational payload when mistake occurs', () => {
      const result = buildEducationalPayload({
        explanation: mockExplanation,
        topic: TOPICS.PHISHING,
        difficulty: 'beginner',
        historicalMistakes: 1,
        selfConfidenceRating: 3,
      });

      expect(result.level).toBe(INTERVENTION_LEVELS.LEVEL_2_CONTEXTUAL_EXPLANATION);
      expect(result.type).toBe('CONTEXTUAL_EXPLANATION');
      expect(result.payload).toBeDefined();

      // Assert all 5 documented fields are present
      expect(result.payload.whatHappened).toBe(mockExplanation.whatHappened);
      expect(result.payload.evidence).toBe(mockExplanation.evidence);
      expect(result.payload.whyDangerous).toBe(mockExplanation.whyDangerous);
      expect(result.payload.correctAction).toBe(mockExplanation.correctAction);
      expect(result.payload.securityTip).toBe(mockExplanation.securityTip);

      expect(result.context.topic).toBe(TOPICS.PHISHING);
      expect(result.context.overconfidenceDetected).toBe(false);
    });

    it('should detect overconfidence when high self-confidence (>= 4) is paired with repeated mistakes (>= 2)', () => {
      const result = buildEducationalPayload({
        explanation: mockExplanation,
        topic: TOPICS.PHISHING,
        difficulty: 'intermediate',
        historicalMistakes: 2,
        selfConfidenceRating: 5, // Self-reported maximum expert
      });

      expect(result.level).toBe(INTERVENTION_LEVELS.LEVEL_3_MICRO_TUTORIAL);
      expect(result.context.overconfidenceDetected).toBe(true);
    });

    it('should return null payload when level is 1 (NONE)', () => {
      const result = buildEducationalPayload({
        explanation: mockExplanation,
        topic: TOPICS.PHISHING,
        historicalMistakes: 0,
        selfConfidenceRating: 5,
      });

      expect(result.level).toBe(INTERVENTION_LEVELS.LEVEL_1_NONE);
      expect(result.payload).toBeNull();
    });
  });
});
