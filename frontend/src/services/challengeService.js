import { api } from './api';

export const challengeService = {
  /**
   * Retrieve sanitized evidence and active challenge presentation data for a room
   */
  async getRoom(roomId, sessionId) {
    const url = sessionId ? `/rooms/${roomId}?sessionId=${sessionId}` : `/rooms/${roomId}`;
    const res = await api.get(url);
    return res.data;
  },

  /**
   * Submit tactical decision for server-side evaluation
   */
  async submitChallenge(challengeId, { sessionId, actionId, containmentSequence, inspectedArtifacts, timeElapsedSeconds }) {
    const res = await api.post(`/challenges/${challengeId}/submit`, {
      sessionId,
      actionId,
      containmentSequence,
      inspectedArtifacts,
      timeElapsedSeconds,
    });
    return res.data;
  },

  /**
   * Request tactical intelligence hint
   */
  async requestHint(challengeId, sessionId) {
    const res = await api.post(`/challenges/${challengeId}/hint`, { sessionId });
    return res.data;
  },
};
