import { apiFetch } from './client';

// taskId scopes this fetch, same pattern as projectId scoping tasks.js.
function listComments(token, taskId) {
  return apiFetch(`/tasks/${taskId}/comments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

function createComment(token, taskId, body) {
  return apiFetch(`/tasks/${taskId}/comments`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ body }),
  });
}

export { listComments, createComment };
