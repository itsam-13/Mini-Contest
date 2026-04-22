import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
    <div className="max-w-6xl mx-auto px-6 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold text-white">Manage Questions</h1><p className="text-surface-100/40 mt-1">{questions.length} questions added</p></div>
        <Link to="/admin" className="btn-secondary text-sm">← Admin</Link>
      </div>

      {/* Add Question Form */}
      <div className="glass-card p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Add Question</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Question Title" required className="input-field"/>
          <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Problem Description" required rows={4} className="input-field resize-y"/>
          <div className="grid md:grid-cols-2 gap-4">
            <textarea value={form.inputFormat} onChange={e => setForm({...form, inputFormat: e.target.value})} placeholder="Input Format" rows={2} className="input-field resize-y"/>
            <textarea value={form.outputFormat} onChange={e => setForm({...form, outputFormat: e.target.value})} placeholder="Output Format" rows={2} className="input-field resize-y"/>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-surface-100/60">Test Cases</h3>
              <button type="button" onClick={addTestCase} className="text-xs text-primary-400 hover:text-primary-300 transition-colors">+ Add Test Case</button>
            </div>
            {testCases.map((tc, i) => (
              <div key={i} className="flex gap-3 mb-3 items-start p-3 rounded-xl bg-surface-900/50 border border-white/5">
                <span className="text-xs text-surface-100/30 mt-3 w-6">#{i+1}</span>
                <textarea value={tc.input} onChange={e => updateTestCase(i, 'input', e.target.value)} placeholder="Input" rows={2} className="input-field flex-1 !py-2 text-sm font-mono resize-y"/>
                <textarea value={tc.expectedOutput} onChange={e => updateTestCase(i, 'expectedOutput', e.target.value)} placeholder="Expected Output" rows={2} className="input-field flex-1 !py-2 text-sm font-mono resize-y"/>
                <input value={tc.marks} onChange={e => updateTestCase(i, 'marks', e.target.value)} type="number" min="1" placeholder="Marks" className="input-field w-20 !py-2 text-sm"/>
                {testCases.length > 1 && <button type="button" onClick={() => removeTestCase(i)} className="text-danger-400 hover:text-danger-300 mt-2 text-lg">×</button>}
              </div>
            ))}
          </div>

          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">{saving ? 'Saving...' : 'Add Question'}</button>
        </form>
      </div>

      {/* Existing Questions */}
      <div className="space-y-4">
        {questions.map((q, i) => (
          <div key={q.id} className="glass-card p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-mono text-surface-100/30">Q{i+1}</span>
                  <h3 className="font-semibold text-white">{q.title}</h3>
                  <span className="badge-accent">{q.testCases?.length || 0} test cases</span>
                </div>
                <p className="text-sm text-surface-100/50 line-clamp-2">{q.description}</p>
              </div>
              <button onClick={() => deleteQuestion(q.id)} className="text-danger-400 hover:text-danger-300 text-sm ml-4">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
