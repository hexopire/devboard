import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { login as loginRequest } from '../api/auth.js';

// Manual loading/error state — no form library (react-hook-form, Formik)
// is in the tech stack, so this is plain useState: one flag for
// "request in flight" (disables the submit button, shows feedback) and one
// for "the last request failed" (shows why). A form library would give you
// both of these for free; hand-rolling them is the point of this task.
function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    // Forms POST and reload the page by default — preventDefault() is what
    // keeps this a client-side fetch instead of a full navigation.
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { user, token } = await loginRequest(email, password);
      login(user, token);
      navigate('/');
    } catch (err) {
      // err.message is whatever apiFetch threw — the backend's own `error`
      // string (e.g. "Invalid credentials"), not a generic fallback.
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        {error && <p role="alert">{error}</p>}
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p>
        No account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}

export default LoginPage;
