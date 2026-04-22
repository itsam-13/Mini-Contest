import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Timer, Award, ArrowLeft, Search, User } from 'lucide-react';
import api from '../api/axios';

export default function Leaderboard() {
  const { id } = useParams();
  const [contest, setContest] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Auto refresh every 30s
    return () => clearInterval(interval);
  }, [id]);

  const fetchData = async () => {
    try {
      const [cRes, eRes] = await Promise.all([
        api.get(`/contests/${id}`),
        api.get(`/contests/${id}/leaderboard`)
      ]);
      setContest(cRes.data);
      setEntries(eRes.data);
    } catch (err) {
      console.error('Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = entries.filter(e => 
    e.userName.toLowerCase().includes(search.toLowerCase())
  );

  const getRankStyle = (rank) => {
    switch (rank) {
      case 1: return "bg-amber-500/10 border-amber-500/30 text-amber-500";
      case 2: return "bg-slate-300/10 border-slate-300/30 text-slate-300";
      case 3: return "bg-orange-600/10 border-orange-600/30 text-orange-600";
      default: return "bg-white/5 border-white/5 text-slate-400";
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Trophy className="w-6 h-6 text-amber-500" />;
      case 2: return <Medal className="w-6 h-6 text-slate-300" />;
      case 3: return <Medal className="w-6 h-6 text-orange-600" />;
      default: return <span className="font-mono font-bold text-lg">{rank}</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <header className="mb-12">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-indigo-400">
              <Trophy className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-widest">Hall of Fame</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">
              {contest?.name || 'Contest'} Leaderboard
            </h1>
          </div>

          <div className="relative group w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Find participant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>
        </div>
      </header>

      {/* Podium for Top 3 */}
      {!loading && filteredEntries.length >= 3 && !search && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-end">
          {/* 2nd Place */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="order-2 md:order-1 glass-card p-6 border-slate-300/20 text-center relative"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-slate-800 border-4 border-slate-300 rounded-full flex items-center justify-center">
              <Medal className="w-6 h-6 text-slate-300" />
            </div>
            <h3 className="mt-4 font-bold text-white text-lg">{filteredEntries[1].userName}</h3>
            <p className="text-slate-400 text-sm font-medium">{filteredEntries[1].score} Pts</p>
          </motion.div>

          {/* 1st Place */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="order-1 md:order-2 glass-card p-8 border-amber-500/30 text-center relative md:scale-110 bg-gradient-to-b from-amber-500/5 to-transparent"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-slate-800 border-4 border-amber-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)]">
              <Trophy className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="mt-6 font-black text-white text-2xl">{filteredEntries[0].userName}</h3>
            <div className="mt-2 inline-flex items-center px-4 py-1 rounded-full bg-amber-500/10 text-amber-500 text-sm font-bold border border-amber-500/20">
              {filteredEntries[0].score} Points
            </div>
          </motion.div>

          {/* 3rd Place */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="order-3 glass-card p-6 border-orange-600/20 text-center relative"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-slate-800 border-4 border-orange-600 rounded-full flex items-center justify-center">
              <Medal className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="mt-4 font-bold text-white text-lg">{filteredEntries[2].userName}</h3>
            <p className="text-slate-400 text-sm font-medium">{filteredEntries[2].score} Pts</p>
          </motion.div>
        </div>
      )}

      {/* Main Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">
                <th className="px-8 py-6 text-left w-24">Rank</th>
                <th className="px-8 py-6 text-left">Participant</th>
                <th className="px-8 py-6 text-center">Score</th>
                <th className="px-8 py-6 text-center">Penalty</th>
                <th className="px-8 py-6 text-right">Time Taken</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredEntries.map((entry, idx) => (
                  <motion.tr 
                    key={entry.userId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-110 ${getRankStyle(idx + 1)}`}>
                        {getRankIcon(idx + 1)}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
                          <User className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-white group-hover:text-indigo-400 transition-colors">
                          {entry.userName}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold text-sm">
                        {entry.score}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`text-sm font-semibold ${entry.penalty > 0 ? 'text-red-400' : 'text-slate-500'}`}>
                        {entry.penalty > 0 ? `-${entry.penalty}` : '0'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="inline-flex items-center gap-2 text-slate-400 text-sm font-mono font-medium">
                        <Timer className="w-3.5 h-3.5" />
                        {Math.floor(entry.timeTaken / 60)}m {entry.timeTaken % 60}s
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {!loading && filteredEntries.length === 0 && (
          <div className="p-12 text-center text-slate-500 font-medium">
            No participants found.
          </div>
        )}
      </div>
    </div>
  );
}
