import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { connectWebSocket, disconnectWebSocket } from '../utils/websocket';

export default function Leaderboard() {
  const { id } = useParams();
  const [entries, setEntries] = useState([]);
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const client = connectWebSocket((stomp) => {
      stomp.subscribe(`/topic/contest/${id}/timer`, () => fetchData());
    });
    return () => disconnectWebSocket();
  }, [id]);

  const fetchData = async () => {
    try {
      const [c, l] = await Promise.all([api.get(`/contests/${id}`), api.get(`/contests/${id}/leaderboard`)]);
      setContest(c.data); setEntries(l.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const getMedal = (rank) => {
    if (rank === 1) return '🥇'; if (rank === 2) return '🥈'; if (rank === 3) return '🥉'; return `#${rank}`;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"/></div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
          <p className="text-surface-100/40 mt-1">{contest?.name} {contest?.status === 'ACTIVE' && <span className="badge-accent ml-2">● Live</span>}</p>
        </div>
        <Link to="/dashboard" className="btn-secondary text-sm">← Dashboard</Link>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5 text-xs text-surface-100/40 uppercase tracking-wider">
              <th className="px-6 py-4 text-left">Rank</th>
              <th className="px-6 py-4 text-left">Participant</th>
              <th className="px-6 py-4 text-center">Solved</th>
              <th className="px-6 py-4 text-center">Score</th>
              <th className="px-6 py-4 text-center">Penalty</th>
              <th className="px-6 py-4 text-center">Time</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-surface-100/40">No submissions yet</td></tr>
            ) : entries.map((e, i) => (
              <tr key={e.userId} className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${i < 3 ? 'bg-primary-500/[0.03]' : ''}`}>
                <td className="px-6 py-4"><span className={`text-lg ${i < 3 ? 'font-bold' : 'text-surface-100/50'}`}>{getMedal(e.rank)}</span></td>
                <td className="px-6 py-4"><p className="font-medium text-white">{e.userName}</p><p className="text-xs text-surface-100/30">{e.userEmail}</p></td>
                <td className="px-6 py-4 text-center"><span className="badge-accent">{e.problemsSolved}</span></td>
                <td className="px-6 py-4 text-center font-bold text-white">{e.totalScore}</td>
                <td className="px-6 py-4 text-center text-danger-400 text-sm">{e.totalPenalty > 0 ? `-${e.totalPenalty}` : '0'}</td>
                <td className="px-6 py-4 text-center text-surface-100/50 text-sm font-mono">{Math.floor(e.totalTimeTaken/60)}m {e.totalTimeTaken%60}s</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
