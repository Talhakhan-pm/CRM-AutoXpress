import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import CallbacksPage from './pages/Callbacks';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuth } from './context/AuthContext';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/callbacks" replace /> : <Login />
      } />
      <Route path="/register" element={
        isAuthenticated ? <Navigate to="/callbacks" replace /> : <Register />
      } />
      
      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/callbacks" replace />} />
        <Route path="callbacks" element={<CallbacksPage />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}

export default App;