import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import SecurityPage from './pages/SecurityPage';
import Layout from './components/Layout';

function Protected({ children }) {
  const { profile, loading } = useAuth();
  if (loading) {
    return <div className="centered">Loading…</div>;
  }
  return profile ? children : <Navigate to="/login" replace />;
}

function PublicOnly({ children }) {
  const { profile, loading } = useAuth();
  if (loading) {
    return <div className="centered">Loading…</div>;
  }
  return profile ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><RegisterPage /></PublicOnly>} />
      <Route
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/security" element={<SecurityPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
