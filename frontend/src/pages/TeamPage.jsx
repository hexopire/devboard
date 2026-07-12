import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getTeamById } from '../api/teams.js';
import { listProjectsByTeam, createProject } from '../api/projects.js';

// useParams() is what SCOPES every fetch on this page: :teamId comes from
// the URL react-router matched (e.g. /teams/2), and every api/ call below
// gets threaded that same id — same idea as the backend reading
// req.params.teamId in projectController.js, just one layer up the stack.
function TeamPage() {
  const { teamId } = useParams();
  const { token } = useAuth();

  const [team, setTeam] = useState(null);
  const [teamError, setTeamError] = useState(null);

  const [projects, setProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [projectsError, setProjectsError] = useState(null);

  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [createError, setCreateError] = useState(null);

  // Two independent requests, two independent effects — team details and
  // the project list can each succeed or fail on their own (e.g. the team
  // exists and loads fine, but you're not actually a member so the
  // projects list 403s). Re-runs whenever :teamId changes (navigating from
  // one team straight to another without unmounting this page).
  useEffect(() => {
    setTeamError(null);
    getTeamById(token, teamId)
      .then(({ team: fetchedTeam }) => setTeam(fetchedTeam))
      .catch((err) => setTeamError(err.message));
  }, [token, teamId]);

  useEffect(() => {
    setIsLoadingProjects(true);
    setProjectsError(null);

    listProjectsByTeam(token, teamId)
      .then(({ projects: fetchedProjects }) => setProjects(fetchedProjects))
      .catch((err) => setProjectsError(err.message))
      .finally(() => setIsLoadingProjects(false));
  }, [token, teamId]);

  async function handleCreateProject(event) {
    event.preventDefault();
    setIsCreatingProject(true);
    setCreateError(null);

    try {
      const { project } = await createProject(token, teamId, newProjectName, newProjectDescription || null);
      setProjects((currentProjects) => [project, ...currentProjects]);
      setNewProjectName('');
      setNewProjectDescription('');
    } catch (err) {
      // Creating a project requires team membership (Task 5.2) AND a
      // non-viewer role (Task 6.2) — either failure surfaces here as the
      // backend's real message, not a swallowed error.
      setCreateError(err.message);
    } finally {
      setIsCreatingProject(false);
    }
  }

  return (
    <div>
      <h1>Team {team ? team.name : teamId}</h1>
      {teamError && <p role="alert">{teamError}</p>}

      <h2>Projects</h2>
      {isLoadingProjects && <p>Loading projects...</p>}
      {projectsError && <p role="alert">{projectsError}</p>}
      {!isLoadingProjects && !projectsError && projects.length === 0 && <p>No projects yet.</p>}
      <ul>
        {projects.map((project) => (
          <li key={project.id}>
            <Link to={`/projects/${project.id}`}>{project.name}</Link>
          </li>
        ))}
      </ul>

      <h2>Create a project</h2>
      <form onSubmit={handleCreateProject}>
        <div>
          <label htmlFor="projectName">Name</label>
          <input
            id="projectName"
            type="text"
            value={newProjectName}
            onChange={(event) => setNewProjectName(event.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="projectDescription">Description</label>
          <input
            id="projectDescription"
            type="text"
            value={newProjectDescription}
            onChange={(event) => setNewProjectDescription(event.target.value)}
          />
        </div>
        {createError && <p role="alert">{createError}</p>}
        <button type="submit" disabled={isCreatingProject}>
          {isCreatingProject ? 'Creating...' : 'Create project'}
        </button>
      </form>

      <p>
        <Link to="/">Back to dashboard</Link>
      </p>
    </div>
  );
}

export default TeamPage;
