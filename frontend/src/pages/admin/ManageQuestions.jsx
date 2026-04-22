import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Trash2, ArrowLeft, BookOpen, Layers, 
  Terminal, Target, HelpCircle, Save, X 
} from 'lucide-react';
import api from '../../api/axios';

export default function ManageQuestions() {
  const { contestId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', inputFormat: '', outputFormat: '' });
  const [testCases, setTestCases] = useState([{ input: '', expectedOutput: '', marks: 10 }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchQuestions(); }, [contestId]);

  const fetchQuestions = async () => {
    try { const r = await api.get(`/admin/questions/${contestId}`); setQuestions(r.data); } catch (e) { console.error(e); }
  };

  const addTestCase = () => setTestCases([...testCases, { input: '', expectedOutput: '', marks: 10 }]);

  const removeTestCase = (i) => setTestCases(testCases.filter((_, idx) => idx !== i));

  const updateTestCase = (i, field, val) => {
    const updated = [...testCases];
    updated[i] = { ...updated[i], [field]: field === 'marks' ? parseInt(val) || 0 : val };
    setTestCases(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/admin/questions', { contestId, ...form, testCases });
      setForm({ title: '', description: '', inputFormat: '', outputFormat: '' });
      setTestCases([{ input: '', expectedOutput: '', marks: 10 }]);
      fetchQuestions();
    } catch (err) { alert(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const deleteQuestion = async (qId) => {
    if (!confirm('Delete this question?')) return;
    try { await api.delete(`/admin/questions/${qId}`); fetchQuestions(); } catch (e) { alert('Failed to delete'); }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <header className="flex items-center justify-between mb-12">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-400">
            <BookOpen className="w-4 h-4" />
            <span className="text-[10px] uppercase font-black tracking-widest">Contest Content</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">Question Bank</h1>
          <p className="text-slate-500 text-sm font-medium">{questions.length} questions configured</p>
        </div>
        <Link to="/admin" className="btn-secondary flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Admin
        </Link>
      </header>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Form */}
        <div className="glass-card p-8">
          <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-500" />
            Add New Problem
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Title</label>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Find Maximum Sum Subarray" required className="input-field"/>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Problem Description</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Describe the logic, constraints, and requirements..." required rows={4} className="input-field resize-none"/>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Input Format</label>
                <textarea value={form.inputFormat} onChange={e => setForm({...form, inputFormat: e.target.value})} placeholder="n items..." rows={2} className="input-field resize-none"/>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Output Format</label>
                <textarea value={form.outputFormat} onChange={e => setForm({...form, outputFormat: e.target.value})} placeholder="single integer..." rows={2} className="input-field resize-none"/>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-400" />
                  Test Cases
                </h3>
                <button type="button" onClick={addTestCase} className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
                  <Plus className="w-3 h-3" /> Add Case
                </button>
              </div>
              
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {testCases.map((tc, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={i} 
                    className="p-4 rounded-xl bg-slate-900/50 border border-white/5 space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-600 uppercase">Case #{i+1}</span>
                      {testCases.length > 1 && (
                        <button type="button" onClick={() => removeTestCase(i)} className="text-red-500 hover:text-red-400 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      <textarea value={tc.input} onChange={e => updateTestCase(i, 'input', e.target.value)} placeholder="Input" className="col-span-2 input-field !py-2 !text-xs font-mono resize-none"/>
                      <textarea value={tc.expectedOutput} onChange={e => updateTestCase(i, 'expectedOutput', e.target.value)} placeholder="Output" className="col-span-2 input-field !py-2 !text-xs font-mono resize-none"/>
                      <input value={tc.marks} onChange={e => updateTestCase(i, 'marks', e.target.value)} type="number" min="1" placeholder="Pts" className="col-span-1 input-field !py-2 !text-xs text-center"/>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={saving} className="w-full btn-primary flex items-center justify-center gap-2 !py-4 shadow-xl">
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Finalize & Save Question'}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="space-y-6">
          <AnimatePresence>
            {questions.map((q, i) => (
              <motion.div 
                key={q.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-6 border-white/5 hover:border-indigo-500/20 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black text-xs">
                        Q{i+1}
                      </div>
                      <h3 className="font-bold text-white group-hover:text-indigo-400 transition-colors">{q.title}</h3>
                      <span className="badge-accent">{q.testCases?.length || 0} Cases</span>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                      {q.description}
                    </p>
                  </div>
                  <button onClick={() => deleteQuestion(q.id)} className="p-2 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {questions.length === 0 && (
            <div className="text-center py-20 glass-card">
              <HelpCircle className="w-12 h-12 text-slate-800 mx-auto mb-4" />
              <p className="text-slate-600 font-medium italic text-sm">No questions added to this contest yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
