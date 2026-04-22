import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { connectWebSocket, disconnectWebSocket } from '../utils/websocket';
import api from '../api/axios';

export default function Dashboard() {
  const { user } = useAuth();
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchContests();
    const client = connectWebSocket((stompClient) => {
      stompClient.subscribe('/topic/contests/notifications', (msg) => {
        const data = JSON.parse(msg.body);
        setNotification(data);
        fetchContests();
        setTimeout(() => setNotification(null), 10000);
      });
    });
    return () => disconnectWebSocket();
  }, []);

  const fetchContests = async () => {
    try {
      const res = await api.get('/contests');
      setContests(res.data);
    } catch (err) {
      console.error('Failed to fetch contests:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE': return <span className="badge-accent">● Active</span>;
      case 'UPCOMING': return <span className="badge-warning">◷ Upcoming</span>;
      case 'ENDED': return <span className="badge-danger">■ Ended</span>;
      default: return null;
    }
  };

  const getContestAction = (contest) => {
    switch (contest.status) {
      case 'ACTIVE':
        return <Link to={`/contest/${contest.id}`} className="btn-primary text-sm !px-4 !py-2">Enter Contest</Link>;
      case 'UPCOMING':
        return contest.startTime
          ? <Link to={`/contest/${contest.id}`} className="btn-secondary text-sm !px-4 !py-2">View Countdown</Link>
          : <span className="text-sm text-surface-100/40">Waiting to start...</span>;
      case 'ENDED':
        return <Link to={`/leaderboard/${contest.id}`} className="btn-secondary text-sm !px-4 !py-2">View Results</Link>;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 animate-fade-in">
      {/* Notification */}
      {notification && (
        <div className="mb-6 p-4 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-300 animate-slide-up flex items-center gap-3">
          <span className="text-2xl">🚀</span>
          <div>
            <p className="font-semibold">{notification.message}</p>
            <p className="text-xs text-primary-400/60 mt-1">Click "View Countdown" to see the timer</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Welcome, {user?.name} 👋</h1>
        <p className="text-surface-100/40 mt-2">Here are your available contests</p>
      </div>

      {/* Contest Cards */}
      {contests.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-4xl mb-4">📭</p>
          <p className="text-surface-100/50 text-lg">No contests available yet</p>
          <p className="text-surface-100/30 text-sm mt-2">Check back later or contact admin</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {contests.map((contest) => (
            <div key={contest.id} className="glass-card p-6 hover:border-primary-500/20 transition-all duration-300 group">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white truncate group-hover:text-primary-300 transition-colors">
                      {contest.name}
                    </h3>
                    {getStatusBadge(contest.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-surface-100/40">
                    <span>⏱ {contest.duration} min</span>
                    {contest.startTime && (
                      <span>📅 {new Date(contest.startTime).toLocaleString()}</span>
                    )}
                    <span>📝 {contest.questionIds?.length || 0} problems</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {contest.status !== 'UPCOMING' && (
                    <Link to={`/leaderboard/${contest.id}`} className="text-sm text-surface-100/50 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5">
                      Leaderboard
                    </Link>
                  )}
                  {getContestAction(contest)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
