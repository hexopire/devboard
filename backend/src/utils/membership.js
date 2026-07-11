// Shared membership-resolution helpers. Originally each of taskController,
// commentController duplicated a version of these; attachmentController
// (Task 10.2) needed the exact same task->project->team chain a third
// time, so they moved here instead of a third copy-paste.
const { findProjectById } = require('../db/projectQueries');
const { findTaskById } = require('../db/taskQueries');
const { isTeamMember } = require('../db/teamMemberQueries');

// One hop: project -> team_id. Used directly by anything that already has
// a projectId (project routes themselves, and task routes nested under a
// project).
async function resolveProjectAndCheckMembership(projectId, userId) {
  const project = await findProjectById(projectId);
  if (!project) {
    return { error: { status: 404, message: 'Project not found' } };
  }
  const isMember = await isTeamMember(project.team_id, userId);
  if (!isMember) {
    return { error: { status: 403, message: 'You are not a member of this team' } };
  }
  return { project };
}

// Two hops: task -> project -> team_id. Used by anything nested under a
// task (comments, attachments) that only has a taskId, not a projectId.
async function resolveTaskAndCheckMembership(taskId, userId) {
  const task = await findTaskById(taskId);
  if (!task) {
    return { error: { status: 404, message: 'Task not found' } };
  }
  const { error, project } = await resolveProjectAndCheckMembership(task.project_id, userId);
  if (error) {
    return { error };
  }
  return { task, project };
}

module.exports = { resolveProjectAndCheckMembership, resolveTaskAndCheckMembership };
