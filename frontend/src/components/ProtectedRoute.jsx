import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUser } from '../services/auth';

const ROLE_DASHBOARDS = {
  LAWYER: '/cases',
  POLICE: '/police/dashboard',
  FAMILY_MEMBER: '/family/dashboard',
  FAMILY: '/family/dashboard',
};

/**
 * ProtectedRoute
 * Checks authentication and optional role requirements.
 * If not authenticated, redirects to /login.
 * If role is not allowed, redirects to the user's appropriate role dashboard.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const user = getUser();
    const userRole = (user?.role === 'FAMILY') ? 'FAMILY_MEMBER' : user?.role;
    const normalizedAllowed = allowedRoles.map(r => r === 'FAMILY' ? 'FAMILY_MEMBER' : r);

    if (!user || !normalizedAllowed.includes(userRole)) {
      const redirectPath = user?.role && ROLE_DASHBOARDS[user.role]
        ? ROLE_DASHBOARDS[user.role]
        : '/login';
      return <Navigate to={redirectPath} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
