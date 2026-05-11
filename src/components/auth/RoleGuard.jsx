import { Navigate, useLocation } from 'react-router-dom';
import { getStoredUser, getStoredToken } from '../../api/client';
import { defaultPathForRole } from '../../config/navigation';

/**
 * Restricts a subtree to one or more roles. Anyone else is bounced to their
 * own default landing page (or /login if not authenticated).
 */
const RoleGuard = ({ allowed, children }) => {
  const location = useLocation();
  const token = getStoredToken();
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;

  const user = getStoredUser();
  if (!user) return <Navigate to="/login" replace />;

  const allow = Array.isArray(allowed) ? allowed : [allowed];
  if (!allow.includes(user.role)) {
    return <Navigate to={defaultPathForRole(user.role)} replace />;
  }
  return children;
};

export default RoleGuard;
