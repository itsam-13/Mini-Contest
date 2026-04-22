import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';

export default function ManageContest() {
  const { id } = useParams();
  const [contest, setContest] = useState(null);

  useEffect(() => {
    api.get(`/contests/${id}`).then(r => setContest(r.data)).catch(console.error);
  }, [id]);

  const startContest = async () => {
    if (!confirm('Start this contest? Countdown of 5 minutes will begin.')) return;
    try { const r = await api.post(`/admin/contests/${id}/start`); setContest(r.data); alert('Contest started! Countdown begins now.'); }
    catch (e) { alert(e.response?.data?.error || 'Failed to start'); }
  };

  if (!contest) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"/></div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold text-white">{contest.name}</h1><p className="text-surface-100/40 mt-1">Contest Management</p></div>
        <Link to="/admin" className="btn-secondary text-sm">← Admin</Link>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="glass-card p-6">
          <h3 className="text-sm text-surface-100/40 mb-1">Duration</h3>
          <p className="text-2xl font-bold text-white">{contest.duration} min</p>
        </div>
        <div className="glass-card p-6">
          <h3 className="text-sm text-surface-100/40 mb-1">Status</h3>
          <p className="text-2xl font-bold text-white">{contest.status}</p>
        </div>
      </div>

      {contest.startTime && (
        <div className="glass-card p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <div><h3 className="text-sm text-surface-100/40 mb-1">Start Time</h3><p className="text-white font-mono">{new Date(contest.startTime).toLocaleString()}</p></div>
            <div><h3 className="text-sm text-surface-100/40 mb-1">End Time</h3><p className="text-white font-mono">{new Date(contest.endTime).toLocaleString()}</p></div>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <Link to={`/admin/questions/${id}`} className="btn-secondary">📝 Manage Questions</Link>
        <Link to={`/leaderboard/${id}`} className="btn-secondary">📊 Leaderboard</Link>
        {contest.status === 'UPCOMING' && !contest.startTime && (
          <button onClick={startContest} className="btn-primary animate-glow">🚀 Start Contest</button>
        )}
      </div>
    </div>
  );
}
