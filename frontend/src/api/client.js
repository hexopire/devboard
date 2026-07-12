// Hardcoded for now — this project has no frontend env-var setup yet, and
// there's only one backend target (local dev). A real deployment would read
// this from import.meta.env instead.
const API_BASE_URL = 'http://localhost:4000/api/v1';

// Every backend response follows the same {success, data} / {success:false,
// error} envelope (PRD Section 7) — this is the ONE place that unwraps it,
// so every caller (auth.js, and whatever Day 14+ adds) just gets the data
// directly or a thrown Error, instead of every component re-checking
// `body.success` by hand.
async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const body = await response.json();

  if (!body.success) {
    throw new Error(body.error || 'Request failed');
  }

  return body.data;
}

export { apiFetch };
