import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

export default function AdminDashboard() {
  const [contests, setContests] = useState([]);
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetchContests(); }, []);

  const fetchContests = async () => {
    try { const r = await api.get('/contests'); setContests(r.data); } catch (e) { console.error(e); }
  };

  const createContest = async (e) => {
    e.preventDefault(); setCreating(true);
    try { await api.post('/admin/contests', { name, duration: parseInt(duration) }); setName(''); setDuration(''); fetchContests(); }
    catch (e) { alert(e.response?.data?.error || 'Failed'); }
    finally { setCreating(false); }
  };

  const startContest = async (id) => {
    if (!confirm('Start contest? It will begin in 5 minutes.')) return;
    try { await api.post(`/admin/contests/${id}/start`); fetchContests(); } catch (e) { alert(e.response?.data?.error || 'Failed'); }
  };

  const getBadge = (s) => {
    if (s === 'ACTIVE') return <span className="badge-accent">● Active</span>;
    if (s === 'UPCOMING') return <span className="badge-warning">◷ Upcoming</span>;
    return <span className="badge-danger">■ Ended</span>;
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Link to="/admin/users" className="glass-card p-6 hover:border-primary-500/20 transition-all group">
          <span className="text-3xl">👥</span>
          <h3 className="mt-3 font-semibold text-white group-hover:text-primary-300 transition-colors">Manage Users</h3>
          <p className="text-sm text-surface-100/40 mt-1">Upload CSV, view participants</p>
        </Link>
        <div className="glass-card p-6"><span className="text-3xl">🏆</span><h3 className="mt-3 font-semibold text-white">Contests</h3><p className="text-sm text-surface-100/40 mt-1">{contests.length} total</p></div>
        <div className="glass-card p-6"><span className="text-3xl">📊</span><h3 className="mt-3 font-semibold text-white">Active</h3><p className="text-sm text-surface-100/40 mt-1">{contests.filter(c=>c.status==='ACTIVE').length} running</p></div>
      </div>

      <div className="glass-card p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Create Contest</h2>
        <form onSubmit={createContest} className="flex gap-4 flex-wrap">
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Contest Name" required className="input-field flex-1 min-w-[200px]"/>
          <input value={duration} onChange={e=>setDuration(e.target.value)} placeholder="Duration (min)" type="number" min="1" required className="input-field w-40"/>
          <button type="submit" disabled={creating} className="btn-primary disabled:opacity-50">{creating ? 'Creating...' : 'Create'}</button>
        </form>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-white/5 text-xs text-surface-100/40 uppercase tracking-wider">
            <th className="px-6 py-4 text-left">Contest</th><th className="px-6 py-4 text-center">Duration</th><th className="px-6 py-4 text-center">Status</th><th className="px-6 py-4 text-right">Actions</th>
          </tr></thead>
          <tbody>
            {contests.map(c => (
              <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="px-6 py-4 font-medium text-white">{c.name}</td>
                <td className="px-6 py-4 text-center text-surface-100/50">{c.duration}m</td>
                <td className="px-6 py-4 text-center">{getBadge(c.status)}</td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <Link to={`/admin/questions/${c.id}`} className="btn-secondary text-xs !px-3 !py-1.5">Questions</Link>
                  {c.status==='UPCOMING' && !c.startTime && <button onClick={()=>startContest(c.id)} className="btn-primary text-xs !px-3 !py-1.5">Start</button>}
                  <Link to={`/leaderboard/${c.id}`} className="text-xs text-surface-100/50 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5">Board</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
