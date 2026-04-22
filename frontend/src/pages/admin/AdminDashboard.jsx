import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Users, Trophy, Activity, Calendar, Clock, Edit2, 
  Trash2, Play, Pause, FastForward, ExternalLink, Code2, Layout
} from 'lucide-react';
import api from '../../api/axios';
import { connectWebSocket, disconnectWebSocket } from '../../utils/websocket';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

export default function AdminDashboard() {
  const [contests, setContests] = useState([]);
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [creating, setCreating] = useState(false);
  const [countdowns, setCountdowns] = useState({});

  useEffect(() => { 
    fetchContests(); 
    const client = connectWebSocket((stomp) => {
      // Logic for multi-contest timer sync can be complex, 
      // simplified here for dashboard overview
    });
    return () => disconnectWebSocket();
  }, []);

  const fetchContests = async () => {
    try { 
      const r = await api.get('/contests'); 
      setContests(r.data); 
    } catch (e) { console.error(e); }
  };

  const createContest = async (e, manualStart = true) => {
    e.preventDefault(); 
    setCreating(true);
    try {
      const payload = { name, duration: parseInt(duration), manualStart };
      if (!manualStart && startDate && startTime) {
        const startDateTime = new Date(`${startDate}T${startTime}`);
        payload.startTime = startDateTime.toISOString();
      }
      await api.post('/admin/contests', payload);
      setName(''); setDuration(''); setStartDate(''); setStartTime(''); fetchContests();
    }
    catch (e) { alert(e.response?.data?.error || 'Failed'); }
    finally { setCreating(false); }
  };

  const startContest = async (id) => {
    if (!confirm('Start contest? It will begin in 5 minutes.')) return;
    try { await api.post(`/admin/contests/${id}/start`); fetchContests(); } catch (e) { alert(e.response?.data?.error || 'Failed'); }
  };

  const deleteContest = async (id) => {
    if (!confirm('Are you sure you want to delete this contest? All questions and submissions will be lost.')) return;
    try { 
      await api.delete(`/admin/contests/${id}`); 
      fetchContests(); 
    } catch (e) { 
      alert(e.response?.data?.error || 'Failed to delete contest'); 
    }
  };

  const pauseContest = async (id) => {
    try { await api.post(`/admin/contests/${id}/pause`); fetchContests(); } catch (e) { alert('Failed to pause'); }
  };

  const resumeContest = async (id) => {
    try { await api.post(`/admin/contests/${id}/resume`); fetchContests(); } catch (e) { alert('Failed to resume'); }
  };

  const extendContest = async (id) => {
    const mins = prompt('How many additional minutes to add?', '15');
    if (!mins) return;
    try { 
      await api.post(`/admin/contests/${id}/extend?additionalMinutes=${mins}`); 
      fetchContests(); 
    } catch (e) { alert('Failed to extend'); }
  };

  const getStatusStyle = (s) => {
    switch(s) {
      case 'ACTIVE': return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case 'UPCOMING': return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case 'PAUSED': return "bg-slate-500/10 text-slate-400 border-slate-500/20";
      default: return "bg-red-500/10 text-red-400 border-red-500/20";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-400">
            <Layout className="w-4 h-4" />
            <span className="text-[10px] uppercase font-black tracking-widest">Admin Control Center</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">Platform Overview</h1>
        </div>
        
        <Link 
          to="/admin/users" 
          className="btn-secondary flex items-center gap-2 !py-3"
        >
          <Users className="w-4 h-4" />
          Manage Participants
        </Link>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Contests', value: contests.length, icon: Trophy, color: 'text-indigo-400' },
          { label: 'Active Sessions', value: contests.filter(c=>c.status==='ACTIVE').length, icon: Activity, color: 'text-emerald-400' },
          { label: 'Upcoming', value: contests.filter(c=>c.status==='UPCOMING').length, icon: Calendar, color: 'text-amber-400' },
          { label: 'Participants', value: 'Live', icon: Users, color: 'text-purple-400' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-3xl font-black text-white mt-1">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Create Form */}
        <div className="lg:col-span-1">
          <div className="glass-card p-8 sticky top-24">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-500" />
              New Contest
            </h2>
            <form onSubmit={(e) => createContest(e, false)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 ml-1">CONTEST NAME</label>
                <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Weekly Challenge #1" required className="input-field !py-2.5"/>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 ml-1">DURATION (MINUTES)</label>
                <input value={duration} onChange={e=>setDuration(e.target.value)} type="number" min="1" required className="input-field !py-2.5"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 ml-1">START DATE</label>
                  <input value={startDate} onChange={e=>setStartDate(e.target.value)} type="date" required className="input-field !py-2.5 text-xs uppercase"/>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 ml-1">START TIME</label>
                  <input value={startTime} onChange={e=>setStartTime(e.target.value)} type="time" required className="input-field !py-2.5 text-xs"/>
                </div>
              </div>
              <button type="submit" disabled={creating} className="w-full btn-primary mt-4">
                {creating ? 'Scheduling...' : 'Schedule Contest'}
              </button>
              <div className="relative py-4 flex items-center">
                <div className="flex-grow border-t border-white/5"></div>
                <span className="flex-shrink mx-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">or</span>
                <div className="flex-grow border-t border-white/5"></div>
              </div>
              <button 
                type="button" 
                onClick={(e) => createContest(e, true)} 
                className="w-full btn-secondary flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                Start Instant Contest
              </button>
            </form>
          </div>
        </div>

        {/* Contest List */}
        <div className="lg:col-span-2">
          <div className="glass-card overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white uppercase tracking-tight">Active Contests</h2>
              <button onClick={fetchContests} className="text-indigo-400 hover:text-indigo-300 transition-colors">
                <Activity className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/[0.02] text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4 text-left">Contest Details</th>
                    <th className="px-6 py-4 text-center">Timing</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <motion.tbody variants={container} initial="hidden" animate="show">
                  {contests.map(c => (
                    <motion.tr key={c.id} variants={item} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-white text-sm">{c.name}</span>
                          <span className="text-[10px] text-slate-500 font-bold mt-0.5">ID: {c.id.substring(0, 8)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                            <Clock className="w-3 h-3 text-indigo-400" />
                            {c.duration}m
                          </div>
                          <span className="text-[10px] text-slate-600 mt-1 uppercase font-bold tracking-wider">
                            {c.startTime ? new Date(c.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Manual'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${getStatusStyle(c.status)}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <Link 
                            to={`/admin/questions/${c.id}`} 
                            className="p-2 rounded-lg bg-white/5 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all"
                            title="Manage Questions"
                          >
                            <Code2 className="w-4 h-4" />
                          </Link>
                          {c.status==='UPCOMING' && !c.startTime && (
                            <button 
                              onClick={()=>startContest(c.id)} 
                              className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          )}
                          {c.status === 'ACTIVE' && (
                            <>
                              <button 
                                onClick={() => pauseContest(c.id)}
                                className="p-2 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-white transition-all"
                                title="Pause Contest"
                              >
                                <Pause className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => extendContest(c.id)}
                                className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all"
                                title="Extend Time"
                              >
                                <FastForward className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {c.status === 'PAUSED' && (
                            <button 
                              onClick={() => resumeContest(c.id)}
                              className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all"
                              title="Resume Contest"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          )}
                          <Link 
                            to={`/leaderboard/${c.id}`} 
                            className="p-2 rounded-lg bg-white/5 text-amber-400 hover:bg-amber-500 hover:text-white transition-all"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <button 
                            onClick={() => deleteContest(c.id)}
                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                            title="Delete Contest"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
            {contests.length === 0 && (
              <div className="p-12 text-center text-slate-500 font-medium italic">
                No contests created yet. Use the sidebar to get started.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
