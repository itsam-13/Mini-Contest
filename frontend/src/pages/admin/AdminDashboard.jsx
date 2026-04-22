import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { connectWebSocket, disconnectWebSocket } from '../../utils/websocket';

export default function AdminDashboard() {
  const [contests, setContests] = useState([]);
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [creating, setCreating] = useState(false);
  const [countdowns, setCountdowns] = useState({});

  useEffect(() => { fetchContests(); }, []);

  useEffect(() => {
    const client = connectWebSocket((stomp) => {
      contests.forEach(c => {
        stomp.subscribe(`/topic/contest/${c.id}/timer`, (msg) => {
          const data = JSON.parse(msg.body);
          setCountdowns(prev => ({ ...prev, [c.id]: data }));
        });
      });
    });
    return () => disconnectWebSocket();
  }, [contests]);

  const fetchContests = async () => {
    try { const r = await api.get('/contests'); setContests(r.data); } catch (e) { console.error(e); }
  };

  const createContest = async (e, manualStart = true) => {
    e.preventDefault(); setCreating(true);
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

  const deleteContest = async (id, name) => {
    if (!confirm(`Delete contest "${name}"?`)) return;
    try { await api.delete(`/admin/contests/${id}`); fetchContests(); } catch (e) { alert(e.response?.data?.error || 'Failed'); }
  };

  const editContest = async (contest) => {
    const newName = prompt('New name:', contest.name);
    if (!newName) return;
    const newDuration = prompt('New duration (min):', contest.duration);
    if (!newDuration || isNaN(newDuration)) return;
    const newStartDate = contest.startTime ? new Date(contest.startTime).toISOString().split('T')[0] : '';
    const newStartTime = contest.startTime ? new Date(contest.startTime).toISOString().split('T')[1].substring(0,5) : '';
    const date = prompt('New start date (leave empty for manual):', newStartDate);
    const time = prompt('New start time:', newStartTime);
    try {
      const payload = { name: newName, duration: parseInt(newDuration) };
      if (date && time) {
        const startDateTime = new Date(`${date}T${time}`);
        payload.startTime = startDateTime.toISOString();
      }
      await api.put(`/admin/contests/${contest.id}`, payload);
      fetchContests();
    } catch (e) { alert(e.response?.data?.error || 'Failed'); }
  };

  const pauseContest = async (id) => {
    if (!confirm('Pause contest?')) return;
    try { await api.post(`/admin/contests/${id}/pause`); fetchContests(); } catch (e) { alert(e.response?.data?.error || 'Failed'); }
  };

  const resumeContest = async (id) => {
    if (!confirm('Resume contest?')) return;
    try { await api.post(`/admin/contests/${id}/resume`); fetchContests(); } catch (e) { alert(e.response?.data?.error || 'Failed'); }
  };

  const extendContest = async (id) => {
    const additional = prompt('Additional minutes:');
    if (!additional || isNaN(additional)) return;
    try { await api.post(`/admin/contests/${id}/extend?additionalMinutes=${additional}`); fetchContests(); } catch (e) { alert(e.response?.data?.error || 'Failed'); }
  };

  const getBadge = (s) => {
    if (s === 'ACTIVE') return <span className="badge-accent">● Active</span>;
    if (s === 'UPCOMING') return <span className="badge-warning">◷ Upcoming</span>;
    if (s === 'PAUSED') return <span className="badge-secondary">⏸ Paused</span>;
    return <span className="badge-danger">■ Ended</span>;
  };

  const formatCountdown = (seconds) => {
    if (seconds <= 0) return 'Starting...';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
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
        <form onSubmit={(e) => createContest(e, false)} className="flex gap-4 flex-wrap">
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Contest Name" required className="input-field flex-1 min-w-[200px]"/>
          <input value={duration} onChange={e=>setDuration(e.target.value)} placeholder="Duration (min)" type="number" min="1" required className="input-field w-40"/>
          <input value={startDate} onChange={e=>setStartDate(e.target.value)} placeholder="Start Date" type="date" required className="input-field w-40"/>
          <input value={startTime} onChange={e=>setStartTime(e.target.value)} placeholder="Start Time" type="time" required className="input-field w-40"/>
          <button type="submit" disabled={creating} className="btn-primary disabled:opacity-50">{creating ? 'Creating...' : 'Schedule Contest'}</button>
        </form>
        <form onSubmit={(e) => createContest(e, true)} className="flex gap-4 flex-wrap mt-4">
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Contest Name" required className="input-field flex-1 min-w-[200px]"/>
          <input value={duration} onChange={e=>setDuration(e.target.value)} placeholder="Duration (min)" type="number" min="1" required className="input-field w-40"/>
          <button type="submit" disabled={creating} className="btn-secondary disabled:opacity-50">{creating ? 'Creating...' : 'Start Now'}</button>
        </form>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-white/5 text-xs text-surface-100/40 uppercase tracking-wider">
            <th className="px-6 py-4 text-left">Contest</th><th className="px-6 py-4 text-center">Duration</th><th className="px-6 py-4 text-center">Start Time</th><th className="px-6 py-4 text-center">Status</th><th className="px-6 py-4 text-right">Actions</th>
          </tr></thead>
          <tbody>
            {contests.map(c => (
              <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="px-6 py-4 font-medium text-white">{c.name}</td>
                <td className="px-6 py-4 text-center text-surface-100/50">{c.duration}m</td>
                <td className="px-6 py-4 text-center text-surface-100/50">{c.startTime ? new Date(c.startTime).toLocaleString() : 'Manual'}</td>
                <td className="px-6 py-4 text-center">{getBadge(c.status)}{countdowns[c.id]?.status === 'UPCOMING' && <div className="text-xs text-surface-100/50 mt-1">{formatCountdown(countdowns[c.id].secondsUntilStart)}</div>}{countdowns[c.id]?.status === 'ACTIVE' && <div className="text-xs text-surface-100/50 mt-1">{formatCountdown(countdowns[c.id].secondsRemaining)}</div>}{countdowns[c.id]?.status === 'PAUSED' && <div className="text-xs text-surface-100/50 mt-1">Paused</div>}</td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <Link to={`/admin/questions/${c.id}`} className="btn-secondary text-xs !px-3 !py-1.5">Questions</Link>
                  {c.status==='UPCOMING' && !c.startTime && <button onClick={()=>startContest(c.id)} className="btn-primary text-xs !px-3 !py-1.5">Start</button>}
                  {c.status==='UPCOMING' && <button onClick={()=>editContest(c)} className="btn-secondary text-xs !px-3 !py-1.5">Edit</button>}
                  {c.status==='UPCOMING' && <button onClick={()=>deleteContest(c.id, c.name)} className="btn-danger text-xs !px-3 !py-1.5">Delete</button>}
                  {c.status==='ACTIVE' && <button onClick={()=>pauseContest(c.id)} className="btn-warning text-xs !px-3 !py-1.5">Pause</button>}
                  {c.status==='PAUSED' && <button onClick={()=>resumeContest(c.id)} className="btn-primary text-xs !px-3 !py-1.5">Resume</button>}
                  {c.status==='PAUSED' && <button onClick={()=>extendContest(c.id)} className="btn-secondary text-xs !px-3 !py-1.5">Extend</button>}
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
