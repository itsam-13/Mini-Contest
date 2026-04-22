import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-surface-800/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-600/30 group-hover:shadow-primary-500/50 transition-shadow">
            <span className="text-white font-bold text-sm">CA</span>
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-primary-400 to-primary-200 bg-clip-text text-transparent">
            CodeArena
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-sm text-surface-100/70 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
            Dashboard
          </Link>
          {isAdmin() && (
            <Link to="/admin" className="text-sm text-primary-400 hover:text-primary-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-primary-500/10">
              Admin Panel
            </Link>
          )}
          <div className="h-6 w-px bg-white/10 mx-1" />
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-surface-100/50">{user?.role}</p>
            </div>
            <button onClick={handleLogout}
              className="px-4 py-1.5 text-sm rounded-lg bg-white/5 text-surface-100/70 hover:text-white hover:bg-white/10 border border-white/5 transition-all">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
