import { useAuth } from '../context/AuthContext.jsx'
import Login from '../components/Login.jsx';




function App() {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated()) {
    return (
      <div>
        <Login/>
      </div>
    );
  }

  return (
    <div>
      <h1>Main App</h1>
      <p>Main app placeholder - NavBar, RecordsDisplay, and NewRecord will go here</p>
    </div>
  );
}

export default App
