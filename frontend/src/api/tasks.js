import { apiFetch } from './client';

// projectId scopes this fetch, same pattern as teamId scoping projects.js —
// read from the URL via useParams in ProjectPage, threaded through here.
function listTasksByProject(token, projectId) {
  return apiFetch(`/projects/${projectId}/tasks`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// status/assigneeId aren't exposed here yet — Task 15.2 adds the status
// control and assignee dropdown. A brand-new task just gets the backend's
// default status ('todo') and no assignee, matching what an empty form
// should produce.
function createTask(token, projectId, title, description, dueDate) {
  return apiFetch(`/projects/${projectId}/tasks`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    // dueDate as '' would fail the backend's YYYY-MM-DD check (it's not
    // `undefined`, it's an empty string) — send null instead when the
    // field was left blank, since the backend treats null/undefined as
    // "no due date" but validates any string it actually receives.
    body: JSON.stringify({ title, description: description || null, dueDate: dueDate || null }),
  });
}

// One shared PATCH for both the status control and the assignee dropdown —
// both just send whichever single field changed. assigneeId of '' (the
// dropdown's "Unassigned" option) needs to become null, same reasoning as
// dueDate in createTask: the backend distinguishes "field not sent" from
// "field sent as an actual value," and an empty string is neither undefined
// nor a valid id.
function updateTask(token, taskId, fields) {
  return apiFetch(`/tasks/${taskId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(fields),
  });
}

function getTaskById(token, taskId) {
  return apiFetch(`/tasks/${taskId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export { listTasksByProject, createTask, updateTask, getTaskById };
