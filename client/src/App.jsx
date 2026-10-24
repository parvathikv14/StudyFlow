import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './state/AuthContext.jsx';
import AppLayout from './components/AppLayout.jsx';
import { LoadingState } from './components/States.jsx';
import LandingPage from './pages/LandingPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import TasksPage from './pages/TasksPage.jsx';
import ProgressPage from './pages/ProgressPage.jsx';

function ProtectedRoute({ children }) {
  const { user, authLoading } = useAuth();
  if (authLoading) return <main className="route-loading"><LoadingState label="Checking your session…" /></main>;
  return user ? children : <Navigate to="/login" replace />;
}

function AuthenticatedLayout() {
  return <ProtectedRoute><AppLayout /></ProtectedRoute>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route element={<AuthenticatedLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/progress" element={<ProgressPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
