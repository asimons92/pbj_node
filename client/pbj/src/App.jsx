import { useAuth } from '../context/AuthContext.jsx'
import Login from '../components/Login.jsx';
import AddNote from '../components/AddNote.jsx';




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
    // navbar
    // dashboard
    <AddNote/>
  );
}

export default App
