import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getProjectById } from '../api/projects.js';
import { listTasksByProject, createTask } from '../api/tasks.js';

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

  useEffect(() => {
    setProjectError(null);
    getProjectById(token, projectId)
      .then(({ project: fetchedProject }) => setProject(fetchedProject))
      .catch((err) => setProjectError(err.message));
  }, [token, projectId]);

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
            <Link to={`/tasks/${task.id}`}>{task.title}</Link> — {task.status}
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
