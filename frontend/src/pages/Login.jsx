import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';

// Lightweight Animated Background Component
function AnimatedBackground() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e) => {
    mouseX.set(e.clientX / window.innerWidth);
    mouseY.set(e.clientY / window.innerHeight);
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const x1 = useTransform(mouseX, [0, 1], [-50, 50]);
  const y1 = useTransform(mouseY, [0, 1], [-50, 50]);
  const x2 = useTransform(mouseX, [0, 1], [50, -50]);
  const y2 = useTransform(mouseY, [0, 1], [50, -50]);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 animate-gradient-x"></div>
      
      {/* Floating Light Blobs */}
      <motion.div 
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
        style={{ x: x1, y: y1 }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
        style={{ x: x2, y: y2 }}
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.5, 0.3, 0.5] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Subtle Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/10 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Animated Input Component
function AnimatedInput({ type, placeholder, value, onChange, icon, ...props }) {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <motion.div 
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <motion.div
        className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
          isFocused ? 'text-cyan-400 scale-110' : 'text-gray-400'
        }`}
        animate={{ rotate: isFocused ? 360 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {icon}
      </motion.div>
      <motion.input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`w-full bg-white/5 backdrop-blur-sm border rounded-xl px-12 py-4 text-white placeholder-gray-400 focus:outline-none transition-all duration-300 ${
          isFocused 
            ? 'border-cyan-400/50 shadow-lg shadow-cyan-400/20 bg-white/10' 
            : 'border-white/10 hover:border-white/20'
        }`}
        whileFocus={{ scale: 1.02 }}
        {...props}
      />
      <motion.div
        className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-300 ${
          isFocused ? 'w-full' : 'w-0'
        }`}
        layoutId="underline"
      />
    </motion.div>
  );
}

// Animated Button Component
function AnimatedButton({ children, loading, ...props }) {
  return (
    <motion.button
      className="w-full relative overflow-hidden bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(139, 92, 246, 0.5)" }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-purple-600 opacity-0 hover:opacity-100 transition-opacity duration-300"
        initial={false}
        animate={{ x: loading ? 0 : '-100%' }}
        transition={{ duration: 0.5 }}
      />
      {loading ? (
        <motion.div 
          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      ) : children}
    </motion.button>
  );
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      navigate(data.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <AnimatedBackground />

      <motion.div 
        className="relative z-10 w-full max-w-md"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 100 }}
      >
        {/* Logo and Title */}
        <motion.div 
          className="text-center mb-10"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <motion.div 
            className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-purple-500 to-cyan-600 flex items-center justify-center shadow-2xl shadow-purple-500/30"
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-3xl font-bold text-white">⚡</span>
          </motion.div>
          <motion.h1 
            className="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-300 bg-clip-text text-transparent drop-shadow-lg mb-2"
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          >
            CodeArena
          </motion.h1>
          <motion.p 
            className="text-surface-100/60 font-medium tracking-wide text-sm uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            DSA Contest Platform
          </motion.p>
        </motion.div>

        {/* Login Card */}
        <motion.div 
          className="glass-card p-8 border border-white/20 bg-white/5 backdrop-blur-xl shadow-2xl rounded-2xl"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          whileHover={{ scale: 1.02, boxShadow: "0 0 50px rgba(139, 92, 246, 0.3)" }}
        >
          <motion.h2 
            className="text-2xl font-semibold text-white mb-2"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Welcome back
          </motion.h2>
          <motion.p 
            className="text-sm text-gray-400 mb-8"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            Sign in to your account to continue
          </motion.p>

          <AnimatePresence>
            {error && (
              <motion.div 
                className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatedInput
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon="📧"
              required
            />
            <AnimatedInput
              type="password"
              placeholder="Enter your roll number"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon="🔒"
              required
            />
            <AnimatedButton type="submit" disabled={loading} loading={loading}>
              Sign In
            </AnimatedButton>
          </form>

          <motion.p 
            className="mt-6 text-center text-xs text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Password is your Roll Number. Contact admin if you need help.
          </motion.p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
