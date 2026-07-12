import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getProjectById } from '../api/projects.js';
import { listTasksByProject, createTask, updateTask } from '../api/tasks.js';
import { listTeamMembers } from '../api/teams.js';

const STATUS_OPTIONS = ['todo', 'in_progress', 'done'];

// Same list/detail shape as TeamPage — :projectId from the URL scopes
// every fetch here, one level further down the nesting (team -> project ->
// task) than TeamPage's team -> project.
function ProjectPage() {
  const { projectId } = useParams();
  const { token } = useAuth();

  const [project, setProject] = useState(null);
  const [projectError, setProjectError] = useState(null);

  const [tasks, setTasks] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [tasksError, setTasksError] = useState(null);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [createError, setCreateError] = useState(null);

  const [members, setMembers] = useState([]);

  useEffect(() => {
    setProjectError(null);
    getProjectById(token, projectId)
      .then(({ project: fetchedProject }) => setProject(fetchedProject))
      .catch((err) => setProjectError(err.message));
  }, [token, projectId]);

  // Waits on `project` to exist because listTeamMembers needs team_id,
  // which only comes from the project fetch above — this is why it's a
  // separate effect keyed on `project`, not bundled into the effect above.
  useEffect(() => {
    if (!project) {
      return;
    }
    listTeamMembers(token, project.team_id)
      .then(({ members: fetchedMembers }) => setMembers(fetchedMembers))
      .catch(() => {
        // Non-fatal: the assignee dropdown just falls back to "Unassigned
        // only" if this fails. Not worth a page-level error for a
        // secondary control.
      });
  }, [token, project]);

  useEffect(() => {
    setIsLoadingTasks(true);
    setTasksError(null);

    listTasksByProject(token, projectId)
      .then(({ tasks: fetchedTasks }) => setTasks(fetchedTasks))
      .catch((err) => setTasksError(err.message))
      .finally(() => setIsLoadingTasks(false));
  }, [token, projectId]);

  async function handleCreateTask(event) {
    event.preventDefault();
    setIsCreatingTask(true);
    setCreateError(null);

    try {
      const { task } = await createTask(token, projectId, newTaskTitle, newTaskDescription, newTaskDueDate);
      setTasks((currentTasks) => [task, ...currentTasks]);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskDueDate('');
    } catch (err) {
      // Creating a task requires team membership AND a non-viewer role
      // (Task 6.2/7.1) — either failure surfaces here verbatim.
      setCreateError(err.message);
    } finally {
      setIsCreatingTask(false);
    }
  }

  // OPTIMISTIC update, not refetch-after-write: the UI updates the instant
  // the dropdown changes, before the PATCH even resolves. The alternative
  // (await the PATCH, then either use its response or re-run
  // listTasksByProject) feels laggy for something this small — a status
  // change should feel instant, not wait a round trip.
  //
  // The trade-off: if the PATCH fails, the UI has already shown a state
  // the server never accepted. That's what the rollback in each .catch
  // below is for — snapshot the previous tasks array, and restore it if
  // the request comes back rejected, so the failure is at least visible
  // and corrected rather than silently wrong.
  //
  // Two separate handlers, not one generic "patch these fields" function:
  // the task object stores assignee_id (snake_case, straight from the
  // backend row) but the PATCH body needs assigneeId (camelCase, what
  // updateTask/express-validator expect) — a single shared function
  // spreading one `fields` object onto both the local task AND the PATCH
  // body would silently update the wrong key on one side or the other.
  async function handleStatusChange(taskId, newStatus) {
    const previousTasks = tasks;
    setTasks((currentTasks) =>
      currentTasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task))
    );

    try {
      await updateTask(token, taskId, { status: newStatus });
    } catch (err) {
      setTasks(previousTasks);
      setTasksError(err.message);
    }
  }

  async function handleAssigneeChange(taskId, rawAssigneeId) {
    const previousTasks = tasks;
    // The dropdown's "Unassigned" option has value="" — that has to become
    // null before it reaches the backend, same reasoning as dueDate/
    // description elsewhere: an empty string isn't a valid user id AND
    // isn't `undefined`, so the backend would validate it as neither.
    const assigneeId = rawAssigneeId === '' ? null : Number(rawAssigneeId);

    setTasks((currentTasks) =>
      currentTasks.map((task) => (task.id === taskId ? { ...task, assignee_id: assigneeId } : task))
    );

    try {
      await updateTask(token, taskId, { assigneeId });
    } catch (err) {
      setTasks(previousTasks);
      setTasksError(err.message);
    }
  }

  return (
    <div>
      <h1>Project {project ? project.name : projectId}</h1>
      {projectError && <p role="alert">{projectError}</p>}

      <h2>Tasks</h2>
      {isLoadingTasks && <p>Loading tasks...</p>}
      {tasksError && <p role="alert">{tasksError}</p>}
      {!isLoadingTasks && !tasksError && tasks.length === 0 && <p>No tasks yet.</p>}
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <Link to={`/tasks/${task.id}`}>{task.title}</Link>{' '}
            <select value={task.status} onChange={(event) => handleStatusChange(task.id, event.target.value)}>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>{' '}
            <select
              value={task.assignee_id ?? ''}
              onChange={(event) => handleAssigneeChange(task.id, event.target.value)}
            >
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </li>
        ))}
      </ul>

      <h2>Create a task</h2>
      <form onSubmit={handleCreateTask}>
        <div>
          <label htmlFor="taskTitle">Title</label>
          <input
            id="taskTitle"
            type="text"
            value={newTaskTitle}
            onChange={(event) => setNewTaskTitle(event.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="taskDescription">Description</label>
          <input
            id="taskDescription"
            type="text"
            value={newTaskDescription}
            onChange={(event) => setNewTaskDescription(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="taskDueDate">Due date</label>
          <input
            id="taskDueDate"
            type="date"
            value={newTaskDueDate}
            onChange={(event) => setNewTaskDueDate(event.target.value)}
          />
        </div>
        {createError && <p role="alert">{createError}</p>}
        <button type="submit" disabled={isCreatingTask}>
          {isCreatingTask ? 'Creating...' : 'Create task'}
        </button>
      </form>

      <p>
        <Link to={project ? `/teams/${project.team_id}` : '/'}>Back to team</Link>
      </p>
    </div>
  );
}

export default ProjectPage;
