import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { connectWebSocket, disconnectWebSocket } from '../utils/websocket';
import { initAntiCheat, destroyAntiCheat } from '../utils/antiCheat';
import CodeEditor from '../components/CodeEditor';
import Timer from '../components/Timer';
import Countdown from '../components/Countdown';
import WarningBanner from '../components/WarningBanner';

export default function Contest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedQ, setSelectedQ] = useState(0);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('java');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [warnings, setWarnings] = useState(0);
  const [terminated, setTerminated] = useState(false);
  const [timerData, setTimerData] = useState(null);
  const [loading, setLoading] = useState(true);

  const defaults = {
    java: 'import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Your code here\n    }\n}',
    cpp: '#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    // Your code here\n    return 0;\n}',
  };

  useEffect(() => { fetchContest(); }, [id]);
  useEffect(() => { setCode(defaults[language]); }, [language]);

  useEffect(() => {
    const client = connectWebSocket((stomp) => {
      stomp.subscribe(`/topic/contest/${id}/timer`, (msg) => setTimerData(JSON.parse(msg.body)));
      stomp.subscribe(`/topic/contest/${id}/status`, (msg) => {
        if (JSON.parse(msg.body).status === 'ENDED') { destroyAntiCheat(); navigate(`/leaderboard/${id}`); }
      });
    });
    return () => { disconnectWebSocket(); destroyAntiCheat(); };
  }, [id]);

  useEffect(() => {
    if (contest?.status === 'ACTIVE' && !terminated) {
      initAntiCheat(() => setTerminated(true), (c) => setWarnings(c));
    }
    return () => destroyAntiCheat();
  }, [contest?.status, terminated]);

  useEffect(() => {
    if (timerData?.status === 'ACTIVE' && questions.length === 0) fetchContest();
  }, [timerData?.status]);

  const fetchContest = async () => {
    try {
      const [c, q] = await Promise.all([api.get(`/contests/${id}`), api.get(`/contests/${id}/questions`)]);
      setContest(c.data); setQuestions(q.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (!questions[selectedQ] || terminated) return;
    setSubmitting(true); setResult(null);
    try {
      const res = await api.post('/submissions', { questionId: questions[selectedQ].id, contestId: id, code, language });
      setResult(res.data);
    } catch (e) { setResult({ error: e.response?.data?.error || 'Submission failed' }); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"/></div>;

  if (terminated) return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center animate-fade-in">
      <div className="text-6xl mb-6">🚫</div>
      <h1 className="text-2xl font-bold text-danger-400 mb-3">Contest Terminated</h1>
      <p className="text-surface-100/50 mb-8">Your contest ended due to repeated tab switching.</p>
      <button onClick={() => navigate('/dashboard')} className="btn-secondary">Back to Dashboard</button>
    </div>
  );

  if (timerData?.status === 'UPCOMING' || (!timerData && contest?.status === 'UPCOMING' && contest?.startTime))
    return <div className="relative"><WarningBanner count={warnings}/><Countdown seconds={timerData?.secondsUntilStart ?? 300}/></div>;

  const currentQ = questions[selectedQ];

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <WarningBanner count={warnings}/>
      <div className="flex items-center justify-between px-6 py-3 bg-surface-800/60 border-b border-white/5">
        <h2 className="text-sm font-semibold text-white truncate">{contest?.name}</h2>
        <div className="flex items-center gap-4">
          <Timer seconds={timerData?.secondsRemaining ?? 0}/>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="px-3 py-1.5 text-sm bg-surface-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary-500">
            <option value="java">Java</option><option value="cpp">C++</option>
          </select>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/2 flex flex-col border-r border-white/5">
          <div className="flex gap-1 px-4 py-2 bg-surface-800/40 border-b border-white/5 overflow-x-auto">
            {questions.map((q, i) => (
              <button key={q.id} onClick={() => { setSelectedQ(i); setResult(null); }}
                className={`px-4 py-1.5 text-sm rounded-lg transition-all whitespace-nowrap ${i === selectedQ ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30' : 'text-surface-100/50 hover:bg-white/5'}`}>Q{i+1}</button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {currentQ ? (
              <div className="animate-fade-in">
                <h3 className="text-xl font-bold text-white mb-4">{currentQ.title}</h3>
                <p className="mb-6 text-surface-100/70 whitespace-pre-wrap">{currentQ.description}</p>
                {currentQ.inputFormat && <div className="mb-4"><h4 className="text-sm font-semibold text-primary-400 mb-2">Input Format</h4><div className="p-3 rounded-lg bg-surface-800 border border-white/5 text-sm font-mono text-surface-100/70 whitespace-pre-wrap">{currentQ.inputFormat}</div></div>}
                {currentQ.outputFormat && <div className="mb-4"><h4 className="text-sm font-semibold text-primary-400 mb-2">Output Format</h4><div className="p-3 rounded-lg bg-surface-800 border border-white/5 text-sm font-mono text-surface-100/70 whitespace-pre-wrap">{currentQ.outputFormat}</div></div>}
              </div>
            ) : <p className="text-surface-100/40">No questions available yet.</p>}
          </div>
        </div>
        <div className="w-1/2 flex flex-col">
          <div className="flex-1 p-2"><CodeEditor language={language} value={code} onChange={(v) => setCode(v || '')}/></div>
          <div className="px-4 py-3 bg-surface-800/40 border-t border-white/5 flex items-center justify-between">
            <div className="flex-1">
              {result && !result.error && (
                <div className={`text-sm animate-slide-up flex items-center gap-2 ${result.result === 'ACCEPTED' ? 'text-accent-400' : result.result === 'PARTIAL' ? 'text-warning-400' : 'text-danger-400'}`}>
                  <span className="font-bold">{result.result}</span><span className="text-surface-100/40">—</span>
                  <span>{result.passedTestCases}/{result.totalTestCases} passed</span><span className="text-surface-100/40">—</span>
                  <span>Score: {result.score}/{result.totalMarks}</span>
                </div>
              )}
              {result?.error && <p className="text-sm text-danger-400 animate-slide-up">{result.error}</p>}
            </div>
            <button onClick={handleSubmit} disabled={submitting || !currentQ} className="btn-primary !py-2 text-sm flex items-center gap-2 disabled:opacity-50">
              {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Evaluating...</> : '▶ Submit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
