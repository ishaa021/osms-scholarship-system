import { useState } from 'react';
import { createScholarship } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddScholarship() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', eligibility: '', deadline: '',
    amount: '', organizationName: '', type: 'internal', applyUrl: '',
  });
  const [docs, setDocs] = useState(['']);
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, amount: Number(form.amount), requiredDocuments: docs.filter(Boolean) };
      if (form.type === 'internal') delete payload.applyUrl;
      await createScholarship(payload);
      toast.success('Scholarship created successfully!');
      navigate('/admin/scholarships');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create scholarship');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
<div>
  <h1 className="
    text-3xl font-bold 
    text-gray-900 dark:text-white
    drop-shadow-[0_3px_10px_rgba(0,0,0,0.8)]
  ">
    Add Scholarship
  </h1>

  <p className="
    text-sm mt-1
    text-gray-800 dark:text-gray-200
    drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]
  ">
    Create a new scholarship for your institution
  </p>
</div>

      {/* FORM CARD */}
      <form
        onSubmit={handleSubmit}
        className="
          card p-6 space-y-5
          bg-[#e2dad6]/90 
          dark:bg-dark-secondary/70
          backdrop-blur-xl
          border border-white/40 dark:border-white/10
          shadow-xl hover:shadow-2xl
          transition-all duration-300
        "
      >

        {/* TYPE SELECTOR */}
        <div>
          <label className="label">Scholarship Type</label>
          <div className="flex gap-3">
            {['internal', 'external'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => set('type', t)}
                className={`
                  flex-1 py-2.5 text-sm font-medium rounded-lg border transition-all capitalize
                  ${form.type === t
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-transparent shadow-md scale-[1.02]'
                    : 'bg-white/70 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-400'}
                `}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* INPUT GRID */}
        <div className="grid sm:grid-cols-2 gap-4">

          <div className="sm:col-span-2">
            <label className="label">Title</label>
            <input className="input focus:scale-[1.02]" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Scholarship " required />
          </div>

          <div>
            <label className="label">Organization Name</label>
            <input className="input focus:scale-[1.02]" value={form.organizationName} onChange={e => set('organizationName', e.target.value)} placeholder="College Trust Fund" required />
          </div>

          <div>
            <label className="label">Amount (₹)</label>
            <input className="input focus:scale-[1.02]" type="number" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0000" required min="1" />
          </div>

          <div>
            <label className="label">Deadline</label>
            <input className="input focus:scale-[1.02]" type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} required min={new Date().toISOString().split('T')[0]} />
          </div>

          {form.type === 'external' && (
            <div>
              <label className="label">Apply URL</label>
              <input className="input focus:scale-[1.02]" type="url" value={form.applyUrl} onChange={e => set('applyUrl', e.target.value)} placeholder="https://..." required />
            </div>
          )}

          <div className="sm:col-span-2">
            <label className="label">Description</label>
            <textarea className="input resize-none focus:scale-[1.02]" rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Scholarship overview..." required />
          </div>

          <div className="sm:col-span-2">
            <label className="label">Eligibility Criteria</label>
            <textarea className="input resize-none focus:scale-[1.02]" rows={2} value={form.eligibility} onChange={e => set('eligibility', e.target.value)} placeholder="Minimum 80% marks..." required />
          </div>
        </div>

        {/* DOCUMENTS */}
        <div>
          <label className="label">Required Documents</label>

          <div className="space-y-2">
            {docs.map((doc, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className="input flex-1 focus:scale-[1.02]"
                  value={doc}
                  placeholder={`Document ${i + 1}`}
                  onChange={e => {
                    const d = [...docs];
                    d[i] = e.target.value;
                    setDocs(d);
                  }}
                />

                {docs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setDocs(docs.filter((_, j) => j !== i))}
                    className="p-2.5 text-gray-400 hover:text-red-500 transition border border-gray-200 dark:border-gray-700 rounded-lg hover:scale-110"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setDocs([...docs, ''])}
            className="mt-3 flex items-center gap-1.5 text-sm text-indigo-600 dark:text-purple-400 hover:underline"
          >
            <Plus className="h-3.5 w-3.5" /> Add document
          </button>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-3 pt-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary flex-1 justify-center"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 justify-center glow"
          >
            {loading
              ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : 'Create Scholarship'}
          </button>
        </div>

      </form>
    </div>
  );
}