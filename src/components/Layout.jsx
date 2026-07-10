import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Layout() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">◆</span> Inventory Manager
        </div>
        <nav className="app-nav">
          <NavLink to="/" end>Products</NavLink>
          <NavLink to="/security">Security</NavLink>
        </nav>
        <div className="app-user">
          <span>{profile?.username}</span>
          <button className="btn btn-ghost" onClick={handleLogout}>Sign out</button>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
