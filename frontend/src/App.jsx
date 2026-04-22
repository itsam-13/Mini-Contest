import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Contest from './pages/Contest';
import Leaderboard from './pages/Leaderboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageContest from './pages/admin/ManageContest';
import ManageQuestions from './pages/admin/ManageQuestions';

function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-surface-900">
      {user && <Navbar />}
      <main className={user ? 'pt-16' : ''}>
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/contest/:id" element={<ProtectedRoute><Contest /></ProtectedRoute>} />
          <Route path="/leaderboard/:id" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute adminOnly><ManageUsers /></ProtectedRoute>} />
          <Route path="/admin/contest/:id" element={<ProtectedRoute adminOnly><ManageContest /></ProtectedRoute>} />
          <Route path="/admin/questions/:contestId" element={<ProtectedRoute adminOnly><ManageQuestions /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
