import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, Trophy, ArrowRight, Timer, Terminal, Search } from 'lucide-react';
import api from '../api/axios';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Dashboard() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      const res = await api.get('/contests');
      setContests(res.data);
    } catch (err) {
      console.error('Failed to fetch contests');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            LIVE
          </span>
        );
      case 'UPCOMING':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
            <Clock className="w-3 h-3" />
            UPCOMING
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-500/10 border border-slate-500/20 text-slate-400 text-xs font-bold">
            ENDED
          </span>
        );
    }
  };

  const filteredContests = contests.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <header className="mb-12">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Arena <span className="text-indigo-500 text-6xl">.</span>
            </h1>
            <p className="text-slate-400 max-w-lg text-lg leading-relaxed font-medium">
              Join live contests, solve challenging problems, and climb the global leaderboard.
            </p>
          </div>
          
          <div className="relative group w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search contests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl pl-12 pr-4 py-4 text-white focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>
        </motion.div>
      </header>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-card h-64 animate-pulse bg-white/5" />
          ))}
        </div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredContests.map((contest) => (
            <motion.div key={contest.id} variants={item} className="group relative">
              {/* Card Glow Effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-0 group-hover:opacity-15 transition duration-500" />
              
              <div className="glass-card h-full relative p-8 flex flex-col hover:border-white/20 transition-all duration-300">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                    <Terminal className="w-6 h-6" />
                  </div>
                  {getStatusBadge(contest.status)}
                </div>

                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">
                  {contest.name}
                </h3>

                <div className="space-y-3 mb-8 flex-grow">
                  <div className="flex items-center gap-3 text-slate-400">
                    <Timer className="w-4 h-4 text-indigo-400/60" />
                    <span className="text-sm font-medium">{contest.duration} Minutes</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <Calendar className="w-4 h-4 text-indigo-400/60" />
                    <span className="text-sm font-medium">
                      {contest.startTime ? new Date(contest.startTime).toLocaleDateString() : 'Manual Start'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-6 border-t border-white/5">
                  <Link 
                    to={contest.status === 'ENDED' ? `/leaderboard/${contest.id}` : `/contest/${contest.id}`}
                    className="flex-1 btn-primary text-center flex items-center justify-center gap-2"
                  >
                    {contest.status === 'ENDED' ? 'View Results' : 'Enter Contest'}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  {contest.status === 'ENDED' && (
                    <Link to={`/leaderboard/${contest.id}`} className="p-2.5 btn-secondary rounded-xl">
                      <Trophy className="w-5 h-5 text-amber-500" />
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {!loading && filteredContests.length === 0 && (
        <div className="text-center py-20 glass-card">
          <p className="text-slate-500 font-medium">No contests found matching your search.</p>
        </div>
      )}
    </div>
  );
}
