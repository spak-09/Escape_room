import { api } from './api';

export const sessionService = {
  /**
   * Initialize a new escape room playthrough or resume active session
   */
  async startSession() {
    const res = await api.post('/session/start');
    return res.data;
  },

  /**
   * Retrieve active in-progress game session
   */
  async getActiveSession() {
    try {
      const res = await api.get('/session/active');
      return res.data?.session;
    } catch (err) {
      if (err?.code === 'ACTIVE_SESSION_NOT_FOUND' || err?.status === 404) {
        return null;
      }
      throw err;
    }
  },

  /**
   * Forfeit and lock the active session
   */
  async abandonSession(sessionId) {
    const res = await api.post('/session/abandon', { sessionId });
    return res.data;
  },
};
