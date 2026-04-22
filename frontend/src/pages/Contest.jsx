import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Timer, ChevronRight, Terminal, Send, AlertTriangle, 
  CheckCircle2, Clock, Play, Code2, Info, BookOpen
} from 'lucide-react';
import api from '../api/axios';
import { connectWebSocket, disconnectWebSocket } from '../utils/websocket';

export default function Contest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [code, setCode] = useState({});
  const [language, setLanguage] = useState('java');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [warnings, setWarnings] = useState(0);

  useEffect(() => {
    fetchContestData();
    const client = connectWebSocket((stomp) => {
      stomp.subscribe(`/topic/contest/${id}/timer`, (msg) => {
        setCountdown(JSON.parse(msg.body));
      });
    });

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden' && contest?.status === 'ACTIVE') {
        reportWarning();
      }
    };

    const handleBlur = () => {
      if (contest?.status === 'ACTIVE') reportWarning();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);

    return () => {
      disconnectWebSocket();
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
    };
  }, [id, contest?.status]);

  const fetchContestData = async () => {
    try {
      const cRes = await api.get(`/contests/${id}`);
      setContest(cRes.data);
      if (cRes.data.status !== 'UPCOMING') {
        const qRes = await api.get(`/contests/${id}/questions`);
        setQuestions(qRes.data);
        const initialCode = {};
        qRes.data.forEach(q => {
          initialCode[q.id] = { java: '// Write your Java code here\npublic class Solution {\n    public static void main(String[] args) {\n        \n    }\n}', cpp: '// Write your C++ code here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}' };
        });
        setCode(initialCode);
      }
    } catch (err) {
      navigate('/dashboard');
    }
  };

  const reportWarning = async () => {
    try {
      const res = await api.post('/auth/warning');
      setWarnings(res.data.warnings);
      if (res.data.terminated) navigate('/dashboard');
    } catch (err) {}
  };

  const handleSubmit = async () => {
    if (!questions[activeQuestion]) return;
    setSubmitting(true);
    setResult(null);
    try {
      const res = await api.post('/submissions', {
        contestId: id,
        questionId: questions[activeQuestion].id,
        code: code[questions[activeQuestion].id][language],
        language: language.toUpperCase()
      });
      setResult(res.data);
    } catch (err) {
      alert('Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || seconds <= 0) return "00:00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!contest) return null;

  if (contest.status === 'UPCOMING') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-12 text-center max-w-lg w-full relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <Clock className="w-12 h-12 text-amber-500 animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">{contest.name}</h2>
          <p className="text-slate-400 mb-8 font-medium">Contest has not started yet. Please wait for the host to begin.</p>
          <div className="p-6 bg-slate-900/50 rounded-2xl border border-white/5">
            <span className="text-sm text-slate-500 uppercase tracking-widest font-bold">Starts In</span>
            <div className="text-5xl font-black text-white mt-2 font-mono tabular-nums">
              {formatTime(countdown?.secondsUntilStart)}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col overflow-hidden">
      {/* Sticky Header with Timer */}
      <div className="glass-morphism border-x-0 border-t-0 px-6 py-3 flex items-center justify-between z-40">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Trophy className="text-white w-4 h-4" />
            </div>
            <h2 className="font-bold text-white hidden sm:block">{contest.name}</h2>
          </div>
          {warnings > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold animate-bounce">
              <AlertTriangle className="w-3.5 h-3.5" />
              Strikes: {warnings}/3
            </div>
          )}
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Time Remaining</span>
            <div className={`text-xl font-black font-mono tabular-nums ${countdown?.secondsRemaining < 300 ? 'text-red-400' : 'text-white'}`}>
              {formatTime(countdown?.secondsRemaining)}
            </div>
          </div>
          <button onClick={() => navigate('/dashboard')} className="btn-secondary !py-1.5 !px-4 text-sm">
            Exit
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Questions Panel */}
        <div className="w-[450px] border-r border-white/5 flex flex-col bg-slate-900/20">
          <div className="p-4 flex gap-2 overflow-x-auto">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => { setActiveQuestion(idx); setResult(null); }}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeQuestion === idx 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                Q{idx + 1}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <AnimatePresence mode="wait">
              {questions[activeQuestion] && (
                <motion.div
                  key={questions[activeQuestion].id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-indigo-400">
                      <BookOpen className="w-4 h-4" />
                      <span className="text-xs font-black uppercase tracking-widest">Problem Statement</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white leading-tight">
                      {questions[activeQuestion].title}
                    </h1>
                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20">
                      {questions[activeQuestion].marks} Points
                    </div>
                  </div>

                  <div className="text-slate-300 leading-relaxed text-sm whitespace-pre-wrap font-medium">
                    {questions[activeQuestion].description}
                  </div>

                  <div className="space-y-4 pt-6 border-t border-white/5">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-indigo-400">
                        <Terminal className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-widest">Constraints</span>
                      </div>
                      <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5 font-mono text-xs text-indigo-300">
                        {questions[activeQuestion].constraints || "Standard time and memory limits apply."}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Code Editor & Result */}
        <div className="flex-1 flex flex-col relative">
          <div className="p-3 glass-morphism border-0 border-b flex items-center justify-between">
            <div className="flex items-center gap-2 bg-slate-950/50 p-1 rounded-xl border border-white/5">
              {['java', 'cpp'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                    language === lang 
                      ? 'bg-slate-800 text-white shadow-lg' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {lang === 'cpp' ? 'C++' : lang}
                </button>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || !questions[activeQuestion]}
              className="btn-primary !py-2 !px-6 flex items-center gap-2 text-sm"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Submit Solution
            </button>
          </div>

          <div className="flex-1 relative">
            <Editor
              height="100%"
              theme="vs-dark"
              language={language === 'java' ? 'java' : 'cpp'}
              value={questions[activeQuestion] ? code[questions[activeQuestion].id][language] : ''}
              onChange={(v) => {
                const newCode = { ...code };
                newCode[questions[activeQuestion].id][language] = v;
                setCode(newCode);
              }}
              options={{
                fontSize: 14,
                fontFamily: 'JetBrains Mono, Fira Code, monospace',
                minimap: { enabled: false },
                padding: { top: 20 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: true,
              }}
            />

            {/* Floating Results Panel */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 100, opacity: 0 }}
                  className="absolute bottom-6 left-6 right-6 z-30"
                >
                  <div className="glass-card p-6 border-2 border-indigo-500/20 shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
                    
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-2xl ${result.passed ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                          {result.passed ? <CheckCircle2 className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {result.passed ? 'All Test Cases Passed!' : 'Failed Verification'}
                          </h3>
                          <p className="text-slate-400 font-medium">
                            Score Earned: <span className="text-white">{result.score}</span> / {questions[activeQuestion].marks}
                          </p>
                        </div>
                      </div>
                      <button onClick={() => setResult(null)} className="text-slate-500 hover:text-white transition-colors">
                        <Info className="w-5 h-5" />
                      </button>
                    </div>

                    {!result.passed && result.errorMessage && (
                      <div className="mt-4 p-4 bg-red-500/5 rounded-xl border border-red-500/10">
                        <div className="text-[10px] uppercase font-black text-red-400 tracking-widest mb-1">Error Trace</div>
                        <pre className="text-xs text-red-300 font-mono whitespace-pre-wrap">{result.errorMessage}</pre>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function Loader2(props) {
  return <Play {...props} className={props.className + " animate-spin"} />
}
