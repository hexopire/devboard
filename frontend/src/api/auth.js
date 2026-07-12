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

export { login, register };
