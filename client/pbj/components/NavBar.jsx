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
    return null; // Don't show navbar if not authenticated
  }

  return (
    <nav className='navbar'>
      <div className='navbar-left'>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h1>PBJ</h1>
        </Link>
      </div>
      <div className='navbar-center'>
        <p>Hello, {user?.email || 'User'}</p>
      </div>
      <div className='navbar-right'>
        <Link to="/add-note" className = "nav-link" >Add Note</Link>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}


