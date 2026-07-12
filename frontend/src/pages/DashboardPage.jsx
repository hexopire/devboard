import { Link } from 'react-router-dom';

// Placeholder only — Task 14.1 builds the real teams list + create form.
// Links below use dummy ids just to exercise the nested route params
// (TeamPage/ProjectPage/TaskDetailPage) until real data is wired in.
function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Your teams will be listed here (Task 14.1).</p>
      <p>
        <Link to="/teams/1">Go to a sample team</Link>
      </p>
    </div>
  );
}

export default DashboardPage;
