import { apiFetch } from './client';

// teamId is what SCOPES this fetch — it comes from the URL (useParams in
// TeamPage), not from anywhere in state. This is the frontend mirror of the
// backend's own nested route (POST /teams/:teamId/projects): the id in the
// path is what tells the server which team's projects to touch, and here
// it's what tells the request which team's projects to ask for.
function listProjectsByTeam(token, teamId) {
  return apiFetch(`/teams/${teamId}/projects`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

function createProject(token, teamId, name, description) {
  return apiFetch(`/teams/${teamId}/projects`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name, description }),
  });
}

export { listProjectsByTeam, createProject };
