import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
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

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);

function App() {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-x-hidden">
      {/* Global Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10">
        {user && <Navbar />}
        <main className={user ? 'pt-20' : ''}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/login" element={
                !user ? <Login /> : <Navigate to="/dashboard" />
              } />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <PageTransition><Dashboard /></PageTransition>
                </ProtectedRoute>
              } />

              <Route path="/contest/:id" element={
                <ProtectedRoute>
                  <PageTransition><Contest /></PageTransition>
                </ProtectedRoute>
              } />

              <Route path="/leaderboard/:id" element={
                <ProtectedRoute>
                  <PageTransition><Leaderboard /></PageTransition>
                </ProtectedRoute>
              } />

              <Route path="/admin" element={
                <ProtectedRoute adminOnly>
                  <PageTransition><AdminDashboard /></PageTransition>
                </ProtectedRoute>
              } />

              <Route path="/admin/users" element={
                <ProtectedRoute adminOnly>
                  <PageTransition><ManageUsers /></PageTransition>
                </ProtectedRoute>
              } />

              <Route path="/admin/contest/:id" element={
                <ProtectedRoute adminOnly>
                  <PageTransition><ManageContest /></PageTransition>
                </ProtectedRoute>
              } />

              <Route path="/admin/questions/:contestId" element={
                <ProtectedRoute adminOnly>
                  <PageTransition><ManageQuestions /></PageTransition>
                </ProtectedRoute>
              } />

              <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default App;
