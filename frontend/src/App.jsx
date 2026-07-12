import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TeamPage from './pages/TeamPage';
import ProjectPage from './pages/ProjectPage';
import TaskDetailPage from './pages/TaskDetailPage';
import NotFoundPage from './pages/NotFoundPage';

// <Routes>/<Route> is what maps a URL path to a component — react-router
// intercepts link clicks and browser back/forward, then swaps which
// component renders WITHOUT a full page reload (unlike a plain <a href>,
// which reloads the document and re-fetches everything from the server).
// BrowserRouter itself lives in main.jsx, wrapping <App /> once — everything
// under it can use routing hooks like useParams/useNavigate.
//
// No auth guarding yet — every route below is reachable by anyone. Task
// 12.3's ProtectedRoute wraps the ones that should require a logged-in
// user (Dashboard/Team/Project/Task), once Task 12.2's AuthContext exists
// to check against.
function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<DashboardPage />} />
      <Route path="/teams/:teamId" element={<TeamPage />} />
      <Route path="/projects/:projectId" element={<ProjectPage />} />
      <Route path="/tasks/:taskId" element={<TaskDetailPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
