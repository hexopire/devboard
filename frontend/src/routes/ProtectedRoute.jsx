import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Wraps a page element: if there's no token, redirect to /login instead of
// rendering the page at all. `replace` swaps the current history entry
// rather than pushing a new one — so hitting the browser's back button from
// /login doesn't just bounce you right back to the protected page you were
// just redirected away from.
//
// Checking `token` (not `user`) is deliberate: token is what every
// authenticated fetch call will need to send as the Authorization header
// (Task 13.1+), so "authenticated" is defined as "has a token," not just
// "has some user object in memory."
function ProtectedRoute({ children }) {
  const { token } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
