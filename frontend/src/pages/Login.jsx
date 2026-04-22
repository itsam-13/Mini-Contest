import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float, Sphere, MeshDistortMaterial } from '@react-three/drei';

function AnimatedBackground() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 5, 2]} intensity={1} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
          <Sphere args={[1.5, 64, 64]} position={[0, 0, -2]}>
            <MeshDistortMaterial 
              color="#3b82f6" 
              attach="material" 
              distort={0.4} 
              speed={2} 
              roughness={0.2}
              metalness={0.8}
            />
          </Sphere>
        </Float>
      </Canvas>
    </div>
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 bg-surface-900">
      {/* 3D Animated Background */}
      <AnimatedBackground />

      {/* Subtle overlays to blend with the 3D scene */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface-900/80 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-800/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md animate-fade-in backdrop-blur-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-2xl shadow-primary-600/30">
            <span className="text-2xl font-bold text-white">CA</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-primary-200 to-primary-500 bg-clip-text text-transparent drop-shadow-lg">
            CodeArena
          </h1>
          <p className="mt-3 text-surface-100/60 font-medium tracking-wide text-sm uppercase">DSA Contest Platform</p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8 border border-white/10 bg-surface-800/30 shadow-2xl">
          <h2 className="text-2xl font-semibold text-white mb-2">Welcome back</h2>
          <p className="text-sm text-surface-100/50 mb-8">Sign in to your account to continue</p>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm animate-slide-up">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-surface-100/70 mb-2">Email Address</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com" required 
                className="w-full bg-surface-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-surface-100/30 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-100/70 mb-2">Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your roll number" required 
                className="w-full bg-surface-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-surface-100/30 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
            </div>
            <button id="login-btn" type="submit" disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-primary-500/25 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-surface-100/40">
            Password is your Roll Number. Contact admin if you need help.
          </p>
        </div>
      </div>
    </div>
  );
}
