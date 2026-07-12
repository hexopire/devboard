import { apiFetch } from './client';

// Both resolve to { user, token } — the same shape AuthContext's login()
// expects, straight from the backend's response envelope with no
// reshaping needed in the component.
function login(email, password) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

function register(name, email, password) {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

// Used on app load (AuthContext) to turn a stored token back into a real
// user object — also doubles as validating that the stored token is still
// good (an expired/tampered token makes this 401, which is the signal to
// clear localStorage instead of trusting stale data).
function getMe(token) {
  return apiFetch('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export { login, register, getMe };
