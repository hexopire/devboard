import { Link } from 'react-router-dom';

// Catch-all for any URL that doesn't match a defined route — the
// client-side equivalent of the backend's JSON 404 handler (app.js), just
// rendering a page instead of a JSON envelope.
function NotFoundPage() {
  return (
    <div>
      <h1>404 — Page not found</h1>
      <p>
        <Link to="/">Back to dashboard</Link>
      </p>
    </div>
  );
}

export default NotFoundPage;
