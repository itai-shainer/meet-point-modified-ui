import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { onAccessTokenChange } from '@/api/client';
import * as authApi from '@/api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  // On boot, try to exchange the httpOnly refresh cookie for a session.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const restored = await authApi.restoreSession();
        if (!cancelled) setUser(restored);
      } catch (error) {
        if (!cancelled) setAuthError({ type: 'unknown', message: error.message });
      } finally {
        if (!cancelled) setIsLoadingAuth(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Drop the local user as soon as the token store is cleared (e.g. a failed
  // refresh triggered from anywhere in the app).
  useEffect(
    () =>
      onAccessTokenChange((token) => {
        if (!token) setUser(null);
      }),
    []
  );

  const login = useCallback(async (credentials) => {
    setAuthError(null);
    const loggedIn = await authApi.login(credentials);
    setUser(loggedIn);
    return loggedIn;
  }, []);

  const register = useCallback(async (details) => {
    setAuthError(null);
    const registered = await authApi.register(details);
    setUser(registered);
    return registered;
  }, []);

  const logout = useCallback(async (redirectTo = '/') => {
    await authApi.logout();
    setUser(null);
    if (redirectTo) window.location.href = redirectTo;
  }, []);

  const deleteAccount = useCallback(async () => {
    await authApi.deleteAccount();
    setUser(null);
    window.location.href = '/';
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const current = await authApi.getCurrentUser();
      setUser(current);
      return current;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoadingAuth,
      authError,
      login,
      register,
      logout,
      deleteAccount,
      refreshUser,
      navigateToLogin: authApi.redirectToLogin,
    }),
    [user, isLoadingAuth, authError, login, register, logout, deleteAccount, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};