import { apiFetch } from './client';

// Every call here needs the token as an explicit param (not read from
// context) — api/ functions are plain fetch wrappers with no React
// dependency, so the caller (a component, via useAuth()) is what supplies
// the token, same pattern as getMe(token) in api/auth.js.
function listTeams(token) {
  return apiFetch('/teams', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

function createTeam(token, name) {
  return apiFetch('/teams', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name }),
  });
}

function getTeamById(token, teamId) {
  return apiFetch(`/teams/${teamId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export { listTeams, createTeam, getTeamById };
