import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

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

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold text-white">Manage Users</h1><p className="text-surface-100/40 mt-1">{users.length} registered users</p></div>
        <Link to="/admin" className="btn-secondary text-sm">← Admin</Link>
      </div>

      <div className="glass-card p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-2">Upload Users via CSV</h2>
        <p className="text-sm text-surface-100/40 mb-4">CSV format: <code className="text-primary-400 bg-surface-800 px-2 py-0.5 rounded text-xs">Name, Email, RollNo</code></p>
        <div className="flex items-center gap-4">
          <label className="btn-primary cursor-pointer text-sm">
            {uploading ? 'Uploading...' : '📁 Choose CSV File'}
            <input type="file" accept=".csv" onChange={handleUpload} className="hidden" disabled={uploading}/>
          </label>
        </div>
        {uploadResult && !uploadResult.error && (
          <div className="mt-4 p-4 rounded-xl bg-accent-500/10 border border-accent-500/20 text-sm animate-slide-up">
            <p className="text-accent-400 font-medium">✓ {uploadResult.created?.length || 0} users created, {uploadResult.skipped?.length || 0} skipped</p>
          </div>
        )}
        {uploadResult?.error && (
          <div className="mt-4 p-4 rounded-xl bg-danger-500/10 border border-danger-500/20 text-sm text-danger-400 animate-slide-up">{uploadResult.error}</div>
        )}
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-white/5 text-xs text-surface-100/40 uppercase tracking-wider">
            <th className="px-6 py-4 text-left">Name</th><th className="px-6 py-4 text-left">Email</th><th className="px-6 py-4 text-center">Role</th><th className="px-6 py-4 text-center">Warnings</th>
          </tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="px-6 py-4 font-medium text-white">{u.name}</td>
                <td className="px-6 py-4 text-surface-100/50 text-sm">{u.email}</td>
                <td className="px-6 py-4 text-center">{u.role === 'ADMIN' ? <span className="badge-warning">Admin</span> : <span className="badge-accent">User</span>}</td>
                <td className="px-6 py-4 text-center">{u.warnings > 0 ? <span className="badge-danger">{u.warnings}</span> : <span className="text-surface-100/30">0</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
