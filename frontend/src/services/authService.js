import { api, setInMemoryAccessToken, clearInMemoryAccessToken } from './api';

export const authService = {
  /**
   * Register a new player account
   */
  async register(username, email, password) {
    const res = await api.post('/auth/register', { username, email, password });
    if (res.data?.accessToken) {
      setInMemoryAccessToken(res.data.accessToken);
    }
    return res.data;
  },

  /**
   * Authenticate player credentials
   */
  async login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.accessToken) {
      setInMemoryAccessToken(res.data.accessToken);
    }
    return res.data;
  },

  /**
   * Exchange HttpOnly refresh cookie for a new access token
   */
  async refresh() {
    const res = await api.post('/auth/refresh');
    if (res.data?.accessToken) {
      setInMemoryAccessToken(res.data.accessToken);
    }
    return res.data;
  },

  /**
   * Terminate player session and clear cookie
   */
  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      clearInMemoryAccessToken();
    }
  },

  /**
   * Fetch currently authenticated player profile
   */
  async getMe() {
    const res = await api.get('/auth/me');
    return res.data?.user;
  },
};
