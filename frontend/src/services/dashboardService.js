import { api } from './api';

export const dashboardService = {
  /**
   * Fetch aggregated player career dashboard summary with active session state
   * @returns {Promise<object>}
   */
  async getDashboardSummary() {
    const res = await api.get('/dashboard/summary');
    return res.data;
  },
};
