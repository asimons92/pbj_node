import { useAuth } from '../context/AuthContext.jsx'
//import Login from './components/Login';




function App() {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated()) {
    return (
      <div>
        <h1>Login Here</h1>
        <p>Login page placeholder - will be replaced with Login component</p>
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
