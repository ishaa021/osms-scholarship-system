import { useEffect, useState } from 'react';
import { getAllApplications, updateAppStatus } from '../../services/api';
import Badge from '../../components/ui/Badge';
import SkeletonCard from '../../components/ui/SkeletonCard';
import EmptyState from '../../components/ui/EmptyState';
import { FileText, CheckCircle, XCircle, Paperclip, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function ViewApplications() {
  const navigate = useNavigate();
  const [apps, setApps]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('');
  const [remark, setRemark]       = useState({});
  const [processing, setProcessing] = useState(null);

  const load = () => {
    setLoading(true);
    const params = filter ? { status: filter } : {};
    getAllApplications(params)
      .then((r) => setApps(r.data.applications))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [filter]);

  const handleUpdate = async (id, status) => {
    setProcessing(id + status);
    try {
      await updateAppStatus(id, { status, adminRemark: remark[id] || '' });
      toast.success(`Application ${status}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Applications</h1>
          <p className="text-sm text-gray9500 dark:text-gray-400 mt-0.5">{apps.length} results</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick link to verify docs page */}
          <button
            onClick={() => navigate('/admin/verify-docs')}
            className="btn-secondary gap-1.5 text-xs"
          >
            <ShieldCheck className="h-3.5 w-3.5" />Verify Documents
          </button>
          {['', 'pending', 'under_review', 'approved', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all capitalize
                ${filter === s
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
                }`}
            >
              {s === 'under_review' ? 'Under Review' : s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(4)].map((_, i) => <SkeletonCard key={i} lines={4} />)}</div>
      ) : apps.length === 0 ? (
        <EmptyState icon={FileText} title="No applications found" description="No applications match the selected filter" />
      ) : (
        <div className="space-y-4">
          {apps.map((app) => {
            const docCount      = app.documents?.length || 0;
            const verifiedCount = app.documents?.filter((d) => d.status === 'verified').length || 0;

            return (
              <div key={app._id} className="card p-5 animate-slide-up">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <Badge status={app.status} />
                      <Badge status={app.scholarship?.type} />
                      {docCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                          <Paperclip className="h-3 w-3" />
                          {verifiedCount}/{docCount} verified
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{app.scholarship?.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                      <span>{app.student?.name}</span>
                      <span className="text-gray-300 dark:text-gray-600">·</span>
                      <span>{app.student?.enrollmentNumber}</span>
                      <span className="text-gray-300 dark:text-gray-600">·</span>
                      <span>{app.student?.email}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">
                      ₹{app.scholarship?.amount?.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">{new Date(app.appliedAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Quick approve/reject for pending applications */}
                {['pending', 'under_review'].includes(app.status) && (
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-400">
                        {app.status === 'under_review'
                          ? 'Documents uploaded — review them before deciding'
                          : 'No documents yet — you can still approve/reject'}
                      </p>
                      {app.status === 'under_review' && (
                        <button
                          onClick={() => navigate('/admin/verify-docs')}
                          className="text-xs text-indigo-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />Review docs
                        </button>
                      )}
                    </div>
                    <input
                      className="input text-sm"
                      placeholder="Remark (optional)"
                      value={remark[app._id] || ''}
                      onChange={(e) => setRemark((r) => ({ ...r, [app._id]: e.target.value }))}
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleUpdate(app._id, 'approved')}
                        disabled={!!processing}
                        className="btn-primary flex-1 justify-center bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                      >
                        {processing === app._id + 'approved'
                          ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          : <><CheckCircle className="h-4 w-4" />Approve</>}
                      </button>
                      <button
                        onClick={() => handleUpdate(app._id, 'rejected')}
                        disabled={!!processing}
                        className="btn-danger flex-1 justify-center"
                      >
                        {processing === app._id + 'rejected'
                          ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          : <><XCircle className="h-4 w-4" />Reject</>}
                      </button>
                    </div>
                  </div>
                )}

                {app.adminRemark && (
                  <p className="mt-3 text-xs text-gray-400 italic border-t border-gray-100 dark:border-gray-800 pt-3">
                    Remark: {app.adminRemark}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
