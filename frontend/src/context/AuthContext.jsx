import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authService } from '../services/authService';
import { getInMemoryAccessToken } from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Bootstrap session on app mount
  useEffect(() => {
    let isMounted = true;

    async function bootstrapAuth() {
      try {
        // Attempt token refresh via HttpOnly cookie
        const refreshData = await authService.refresh();
        if (refreshData?.user) {
          if (isMounted) {
            setUser({
              ...refreshData.user,
              id: refreshData.user._id || refreshData.user.id,
            });
          }
        } else {
          // If refresh returned token without user or partial user, fetch profile
          const userProfile = await authService.getMe();
          if (isMounted && userProfile) {
            setUser({
              ...userProfile,
              id: userProfile._id || userProfile.id,
            });
          }
        }
      } catch {
        // No valid refresh token cookie exists -> unauthenticated guest state
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    bootstrapAuth();

    // Listen for global auth:expired event from Axios interceptor
    const handleAuthExpired = () => {
      setUser(null);
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => {
      isMounted = false;
      window.removeEventListener('auth:expired', handleAuthExpired);
    };
  }, []);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const data = await authService.login(email, password);
      const userData = {
        ...data.user,
        id: data.user._id || data.user.id,
      };
      setUser(userData);
      return userData;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (username, email, password) => {
    setIsLoading(true);
    try {
      const data = await authService.register(username, email, password);
      const userData = {
        ...data.user,
        id: data.user._id || data.user.id,
      };
      setUser(userData);
      return userData;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      logout,
      accessToken: getInMemoryAccessToken(),
    }),
    [user, isLoading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
