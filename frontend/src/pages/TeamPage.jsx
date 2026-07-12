import { Link, useParams } from 'react-router-dom';

// Placeholder only — Task 14.2 builds the real team's-projects list + create
// form. useParams() is the whole point of this task: it reads the :teamId
// segment out of the URL react-router matched, the same way req.params did
// on the backend.
function TeamPage() {
  const { teamId } = useParams();

  return (
    <div>
      <h1>Team {teamId}</h1>
      <p>This team's projects will be listed here (Task 14.2).</p>
      <p>
        <Link to="/projects/1">Go to a sample project</Link>
      </p>
      <p>
        <Link to="/">Back to dashboard</Link>
      </p>
    </div>
  );
}

export default TeamPage;
