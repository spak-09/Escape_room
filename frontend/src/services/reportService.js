import { api } from './api';

export const reportService = {
  /**
   * Fetch authoritative Cybersecurity Performance Report for a completed escape session
   * @param {string} sessionId
   * @returns {Promise<object>}
   */
  async getSessionReport(sessionId) {
    const res = await api.get(`/reports/${sessionId}`);
    return res.data;
  },
};
