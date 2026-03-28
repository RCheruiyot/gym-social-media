import React, { createContext, useContext, useMemo, useState } from 'react';

const STORAGE_KEY = 'fitmarket_role';

const RoleContext = createContext(null);

export const RoleProvider = ({ children }) => {
  const [role, setRoleState] = useState(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === 'client' || stored === 'trainer' ? stored : null;
  });

  const setRole = (nextRole) => {
    if (nextRole !== 'client' && nextRole !== 'trainer') return;
    window.localStorage.setItem(STORAGE_KEY, nextRole);
    setRoleState(nextRole);
  };

  const clearRole = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setRoleState(null);
  };

  const value = useMemo(() => ({ role, setRole, clearRole }), [role]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};

export const useRole = () => {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used inside <RoleProvider>');
  return ctx;
};

