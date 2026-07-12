import { Link, useParams } from 'react-router-dom';

// Placeholder only — Task 15.1 builds the real task list + create form.
function ProjectPage() {
  const { projectId } = useParams();

  return (
    <div>
      <h1>Project {projectId}</h1>
      <p>This project's tasks will be listed here (Task 15.1).</p>
      <p>
        <Link to="/tasks/1">Go to a sample task</Link>
      </p>
      <p>
        <Link to="/teams/1">Back to team</Link>
      </p>
    </div>
  );
}

export default ProjectPage;
