import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TeamPage from './pages/TeamPage';
import ProjectPage from './pages/ProjectPage';
import TaskDetailPage from './pages/TaskDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './routes/ProtectedRoute.jsx';

// <Routes>/<Route> is what maps a URL path to a component — react-router
// intercepts link clicks and browser back/forward, then swaps which
// component renders WITHOUT a full page reload (unlike a plain <a href>,
// which reloads the document and re-fetches everything from the server).
// BrowserRouter itself lives in main.jsx, wrapping <App /> once — everything
// under it can use routing hooks like useParams/useNavigate.
//
// Dashboard/Team/Project/Task all require a logged-in user — each is
// wrapped in <ProtectedRoute>, which redirects to /login if there's no
// token in AuthContext. Login/Register stay unwrapped since they're the
// only routes a logged-out user can actually reach.
function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teams/:teamId"
        element={
          <ProtectedRoute>
            <TeamPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:projectId"
        element={
          <ProtectedRoute>
            <ProjectPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks/:taskId"
        element={
          <ProtectedRoute>
            <TaskDetailPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
