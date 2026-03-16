import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useRole } from './RoleContext';

const RequireRole = ({ allowedRole, children }) => {
  const { role } = useRole();
  const location = useLocation();

  if (!role) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  if (role !== allowedRole) {
    return <Navigate to={role === 'client' ? '/client' : '/trainer'} replace />;
  }

  return children;
};

export default RequireRole;

