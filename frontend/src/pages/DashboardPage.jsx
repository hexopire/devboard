import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Placeholder only — Task 14.1 builds the real teams list + create form.
// Links below use dummy ids just to exercise the nested route params
// (TeamPage/ProjectPage/TaskDetailPage) until real data is wired in.
//
// No "not logged in" branch needed here — ProtectedRoute (Task 12.3)
// guarantees this only ever renders when a token exists, so `user` is
// always populated by the time this runs.
function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>
        Logged in as <strong>{user.name}</strong> ({user.role}) —{' '}
        <button type="button" onClick={logout}>
          Logout
        </button>
      </p>
      <p>Your teams will be listed here (Task 14.1).</p>
      <p>
        <Link to="/teams/1">Go to a sample team</Link>
      </p>
    </div>
  );
}

export default DashboardPage;
