import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Placeholder only — Task 13.1 builds the real login form (raw fetch,
// loading/error state) and replaces the temporary button below.
function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Stands in for what Task 13.1's real submit handler will do: call
  // login(user, token) with whatever POST /auth/login returns, then
  // navigate to the page the user was headed to. Lives here (not
  // Dashboard) specifically because /login is the one route a logged-out
  // user can actually reach — ProtectedRoute (Task 12.3) would otherwise
  // bounce them away before they could ever click a login button placed on
  // a protected page.
  function handleFakeLogin() {
    login({ id: 1, name: 'Test User', email: 'test@example.com', role: 'member' }, 'fake-jwt-token');
    navigate('/');
  }

  return (
    <div>
      <h1>Login</h1>
      <p>Login form goes here (Task 13.1).</p>
      <button type="button" onClick={handleFakeLogin}>
        Simulate login
      </button>
      <p>(temporary, Task 13.1 replaces this with a real form)</p>
      <p>
        No account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}

export default LoginPage;
