import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Placeholder only — Task 14.1 builds the real teams list + create form.
// Links below use dummy ids just to exercise the nested route params
// (TeamPage/ProjectPage/TaskDetailPage) until real data is wired in.
function DashboardPage() {
  const { user, login, logout } = useAuth();

  // Fakes what Task 13.1's real login form will do after a successful
  // fetch: call login(user, token) with whatever the backend returned.
  // This button exists only to prove AuthContext actually re-renders
  // consumers when state changes — Task 13.1 removes it and wires this
  // same login() call to a real form submit instead.
  function handleFakeLogin() {
    login({ id: 1, name: 'Test User', email: 'test@example.com', role: 'member' }, 'fake-jwt-token');
  }

  return (
    <div>
      <h1>Dashboard</h1>
      {user ? (
        <p>
          Logged in as <strong>{user.name}</strong> ({user.role}) —{' '}
          <button type="button" onClick={logout}>
            Logout
          </button>
        </p>
      ) : (
        <p>
          Not logged in —{' '}
          <button type="button" onClick={handleFakeLogin}>
            Simulate login
          </button>{' '}
          (temporary, Task 13.1 replaces this with a real form)
        </p>
      )}
      <p>Your teams will be listed here (Task 14.1).</p>
      <p>
        <Link to="/teams/1">Go to a sample team</Link>
      </p>
    </div>
  );
}

export default DashboardPage;
