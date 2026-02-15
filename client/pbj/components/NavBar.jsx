import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function NavBar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-4 py-3 bg-white shadow-md">
      {/* Logo / Brand */}
      <div className="flex">
        <Link to="/" className="no-underline">
          <h1 className="text-2xl font-bold tracking-wider text-blue-600 hover:text-blue-800 transition-colors">
            PBJ
          </h1>
        </Link>
      </div>

      {/* User greeting */}
      <div className="flex items-center">
        <p className="text-slate-800 text-base">
          Hello, {user?.username || 'User'}
        </p>
      </div>

      {/* Navigation links */}
      <div className="flex items-center gap-4">
        <Link 
          to="/add-note" 
          className="text-slate-700 hover:text-blue-600 transition-colors no-underline"
        >
          Add Note
        </Link>
        <Link 
          to="/roster" 
          className="text-slate-700 hover:text-blue-600 transition-colors no-underline"
        >
          Roster
        </Link>
        <button 
          onClick={handleLogout}
          className="px-4 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
