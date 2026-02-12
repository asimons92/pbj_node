import { Routes, Route, Navigate } from 'react-router-dom';
import Roster from '../components/Roster.jsx';
import Login from '../components/Login.jsx';
import AddNote from '../components/AddNote.jsx';
import NavBar from '../components/NavBar.jsx';
import Dashboard from '../components/Dashboard.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import './App.css';
import RosterUpload from '../components/RosterUpload.jsx';


function App() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<Login />} />
      
      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <NavBar />
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-note"
        element={
          <ProtectedRoute>
            <NavBar />
            <AddNote />
          </ProtectedRoute>
        }
      />
      <Route
            path="/roster"
            element={
              <ProtectedRoute>
                <NavBar />
                <Roster />
              </ProtectedRoute>
            }
      />
      <Route
            path="/roster/upload"
            element={
              <ProtectedRoute>
                <NavBar />
                <RosterUpload />
              </ProtectedRoute>
            }
      />

        
      {/* Catch all - redirect to home if authenticated, login if not */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App
