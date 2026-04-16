import { useEffect, useState } from 'react';
import { getScholarships, deleteScholarship } from '../../services/api';
import SkeletonCard from '../../components/ui/SkeletonCard';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Badge from '../../components/ui/Badge';
import { BookOpen, Plus, Trash2, Eye, Calendar, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ManageScholarships() {
  const navigate = useNavigate();
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [delId, setDelId] = useState(null);

  const load = () => {
    setLoading(true);
    getScholarships().then(r => setScholarships(r.data.scholarships)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    try {
      await deleteScholarship(delId);
      toast.success('Scholarship removed');
      setDelId(null);
      load();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Manage Scholarships</h1>
          <p className="text-lg text-gray-1000 dark:text-gray-400 mt-0.5">{scholarships.length} total</p>
        </div>
        <button onClick={() => navigate('/admin/add-scholarship')} className="btn-primary">
          <Plus className="h-4 w-4" /> Add New
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(4)].map((_, i) => <SkeletonCard key={i} lines={3} />)}</div>
      ) : scholarships.length === 0 ? (
        <EmptyState icon={BookOpen} title="No scholarships yet"
          description="Create your first scholarship for students"
          action={<button onClick={() => navigate('/admin/add-scholarship')} className="btn-primary"><Plus className="h-4 w-4" />Add Scholarship</button>} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  {['Title', 'Type', 'Amount', 'Deadline', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {scholarships.map(s => {
                  const expired = new Date(s.deadline) < new Date();
                  return (
<tr
  key={s._id}
  className="
    hover:bg-indigo-50/70 
    dark:hover:bg-indigo-900/30 
    hover:shadow-sm
    transition-all duration-200
  "
>
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900 dark:text-white max-w-[180px] truncate">{s.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{s.organizationName}</p>
                      </td>
                      <td className="px-5 py-4"><Badge status={s.type} /></td>
                      <td className="px-5 py-4 font-medium text-emerald-600 dark:text-emerald-400">₹{s.amount?.toLocaleString()}</td>
                      <td className="px-5 py-4 text-gray-500 dark:text-gray-400 text-xs">{new Date(s.deadline).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        {expired ? <span className="badge-rejected">Expired</span> : <span className="badge-approved">Active</span>}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => navigate(`/scholarships/${s._id}`)}
                            className="p-1.5 text-gray-400 hover:text-primary-500 transition-colors rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button onClick={() => setDelId(s._id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!delId} danger title="Delete Scholarship"
        message="This will hide the scholarship from students. This cannot be undone."
        onConfirm={handleDelete} onCancel={() => setDelId(null)} />
    </div>
  );
}