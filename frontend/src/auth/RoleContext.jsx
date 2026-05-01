import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { loginUser, signupUser } from '../api/auth';

const STORAGE_KEY = 'fitmarket_auth_user';

const RoleContext = createContext(null);

export const RoleProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    try {
      const parsed = JSON.parse(stored);
      return parsed && (parsed.role === 'client' || parsed.role === 'trainer') ? parsed : null;
    } catch (error) {
      return null;
    }
  });

  const persistUser = useCallback((nextUser) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const signup = useCallback(async ({ username, email, password, role }) => {
    const nextUser = await signupUser({ username, email, password, role });
    persistUser(nextUser);
    return nextUser;
  }, [persistUser]);

  const login = useCallback(async ({ email, password }) => {
    const nextUser = await loginUser({ email, password });
    persistUser(nextUser);
    return nextUser;
  }, [persistUser]);

  const clearRole = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const role = user?.role ?? null;
  const userId = user?.id ? Number(user.id) : null;

  const value = useMemo(
    () => ({ role, user, userId, signup, login, clearRole }),
    [role, user, userId, signup, login, clearRole],
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};

export const useRole = () => {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used inside <RoleProvider>');
  return ctx;
};
