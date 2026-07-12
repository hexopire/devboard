import { Link } from 'react-router-dom';

// Placeholder only — Task 13.1 builds the real login form (raw fetch,
// loading/error state). This task is just proving the route itself exists
// and is reachable.
function LoginPage() {
  return (
    <div>
      <h1>Login</h1>
      <p>Login form goes here (Task 13.1).</p>
      <p>
        No account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}

export default LoginPage;
