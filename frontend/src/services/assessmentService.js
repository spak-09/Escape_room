import { api } from './api';

export const assessmentService = {
  /**
   * Submit pre-game 4-topic baseline confidence ratings
   */
  async submitAssessment({ phishingConfidence, passwordConfidence, qrConfidence, socialConfidence, tutorialRequested }) {
    const res = await api.post('/assessment', {
      phishingConfidence,
      passwordConfidence,
      qrConfidence,
      socialConfidence,
      tutorialRequested: Boolean(tutorialRequested),
    });
    return res.data?.assessment;
  },

  /**
   * Retrieve saved baseline confidence profile
   */
  async getAssessment() {
    try {
      const res = await api.get('/assessment');
      return res.data?.assessment;
    } catch {
      return null;
    }
  },
};
