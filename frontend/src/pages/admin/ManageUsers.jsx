import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Upload, ArrowLeft, ShieldAlert, CheckCircle2, 
  FileSpreadsheet, UserPlus, Search, ShieldCheck 
} from 'lucide-react';
import api from '../../api/axios';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try { const r = await api.get('/admin/users'); setUsers(r.data); } catch (e) { console.error(e); }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true); setUploadResult(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const r = await api.post('/admin/upload-users', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUploadResult(r.data);
      fetchUsers();
    } catch (err) { setUploadResult({ error: err.response?.data?.error || 'Upload failed' }); }
    finally { setUploading(false); e.target.value = ''; }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-400">
            <Users className="w-4 h-4" />
            <span className="text-[10px] uppercase font-black tracking-widest">Access Control</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">Manage Participants</h1>
          <p className="text-slate-500 text-sm font-medium">{users.length} total users registered</p>
        </div>
        <Link to="/admin" className="btn-secondary flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Admin
        </Link>
      </header>

      <div className="grid lg:grid-cols-3 gap-8 items-start mb-8">
        {/* Upload Widget */}
        <div className="lg:col-span-1">
          <div className="glass-card p-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-500" />
              Batch Import
            </h2>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Upload a CSV file with columns: <br />
              <code className="text-indigo-400 font-bold bg-white/5 px-2 py-0.5 rounded text-xs">Name, Email, RollNo</code>
            </p>
            
            <label className={`w-full flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all ${
              uploading ? 'bg-indigo-500/10 border-indigo-500' : 'bg-slate-900/30 border-white/5 hover:border-indigo-500/40 hover:bg-white/5'
            }`}>
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                  <FileSpreadsheet className={`w-6 h-6 ${uploading ? 'text-indigo-400 animate-bounce' : 'text-slate-500'}`} />
                </div>
                <div className="text-center">
                  <span className="text-sm font-bold text-white block">
                    {uploading ? 'Uploading...' : 'Click to Upload'}
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">
                    CSV format only
                  </span>
                </div>
              </div>
              <input type="file" accept=".csv" onChange={handleUpload} className="hidden" disabled={uploading}/>
            </label>

            <AnimatePresence>
              {uploadResult && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`mt-6 p-4 rounded-xl border flex items-start gap-3 ${
                    uploadResult.error 
                      ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  }`}
                >
                  {uploadResult.error ? <ShieldAlert className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                  <div className="text-sm font-medium">
                    {uploadResult.error ? uploadResult.error : (
                      <>
                        <span className="font-bold">{uploadResult.created?.length || 0}</span> users created successfully.
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* User Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between gap-4">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/[0.02] text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4 text-left">Participant</th>
                    <th className="px-6 py-4 text-center w-32">Role</th>
                    <th className="px-6 py-4 text-center w-32">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredUsers.map((u, i) => (
                      <motion.tr 
                        key={u.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.01 }}
                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-white text-sm group-hover:text-indigo-400 transition-colors">{u.name}</span>
                            <span className="text-[10px] text-slate-500 font-bold mt-0.5">{u.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {u.role === 'ADMIN' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-500 text-[10px] font-black border border-amber-500/20">
                              <ShieldCheck className="w-3 h-3" /> ADMIN
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-[10px] font-black border border-indigo-500/20">
                              <UserPlus className="w-3 h-3" /> USER
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {u.warnings > 0 ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 text-red-500 text-[10px] font-black border border-red-500/20">
                              {u.warnings} STRIKES
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-600 font-black uppercase">CLEAN</span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
            {filteredUsers.length === 0 && (
              <div className="p-12 text-center text-slate-500 font-medium italic text-sm">
                No users found matching your search.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
