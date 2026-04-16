import { useEffect, useState } from 'react';
import { getMyApplications, withdrawApplication, uploadDocuments } from '../../services/api';
import Badge from '../../components/ui/Badge';
import SkeletonCard from '../../components/ui/SkeletonCard';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import {
  FileText, Calendar, XCircle, Upload, ChevronDown,
  ChevronUp, Paperclip, CheckCircle, Clock, X, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// Doc status badge helper
function DocBadge({ status }) {
  const map = {
    pending:  'badge-pending',
    verified: 'badge-approved',
    rejected: 'badge-rejected',
  };
  return <span className={map[status] || 'badge-pending'}>{status}</span>;
}

// Per-application document upload panel
function DocUploadPanel({ app, onUploaded }) {
  const [docFiles, setDocFiles] = useState({});
  const [uploading, setUploading] = useState(false);

  const requiredDocs = app.scholarship?.requiredDocuments || [];

  const handleFileSelect = (docName, file) => {
    if (!file) return;
    setDocFiles((prev) => ({ ...prev, [docName]: file }));
  };
  const removeFile = (docName) => {
    setDocFiles((prev) => { const n = { ...prev }; delete n[docName]; return n; });
  };

  const handleUpload = async () => {
    if (Object.keys(docFiles).length === 0) return toast.error('Select at least one file');
    setUploading(true);
    try {
      const formData = new FormData();
      Object.values(docFiles).forEach((file) => formData.append('files', file));
      await uploadDocuments(app._id, formData);
      toast.success('Documents uploaded successfully!');
      setDocFiles({});
      onUploaded();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Already uploaded docs
  const uploadedDocs = app.documents || [];

  return (
    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-4">

      {/* Already uploaded */}
      {uploadedDocs.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Uploaded Documents
          </p>
          <div className="space-y-2">
            {uploadedDocs.map((doc) => (
              <div key={doc._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Paperclip className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{doc.name}</p>
                    {doc.adminNote && (
                      <p className="text-xs text-red-500 mt-0.5">{doc.adminNote}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <DocBadge status={doc.status} />
                  <a href={doc.url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-indigo-600 dark:text-purple-400 hover:underline">
                    View
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload new / remaining docs (only for pending/under_review) */}
      {['pending', 'under_review'].includes(app.status) && requiredDocs.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            {uploadedDocs.length > 0 ? 'Re-upload or Add Documents' : 'Upload Required Documents'}
          </p>
          <div className="space-y-2">
            {requiredDocs.map((docName) => {
              const file = docFiles[docName];
              return (
                <div key={docName} className="border border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{docName}</span>
                    {file && (
                      <button onClick={() => removeFile(docName)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  {file ? (
                    <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                      <CheckCircle className="h-4 w-4" />
                      <span className="truncate">{file.name}</span>
                      <span className="text-xs text-gray-400">({(file.size / 1024).toFixed(0)}KB)</span>
                    </div>
                  ) : (
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-400 hover:text-indigo-500 transition-colors">
                      <Upload className="h-4 w-4" />
                      <span>Click to select file</span>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="hidden"
                        onChange={(e) => handleFileSelect(docName, e.target.files[0])}
                      />
                    </label>
                  )}
                </div>
              );
            })}
          </div>

          {Object.keys(docFiles).length > 0 && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="btn-primary mt-3 w-full justify-center"
            >
              {uploading
                ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Upload className="h-4 w-4" />Upload {Object.keys(docFiles).length} file(s)</>}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function MyApplications() {
  const navigate = useNavigate();
  const [apps, setApps]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('');
  const [confirm, setConfirm]   = useState(null);
  const [expanded, setExpanded] = useState({}); // { appId: true/false }

  const load = () => {
    setLoading(true);
    const params = filter ? { status: filter } : {};
    getMyApplications(params)
      .then((r) => setApps(r.data.applications))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const toggleExpand = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleWithdraw = async () => {
    try {
      await withdrawApplication(confirm);
      toast.success('Application withdrawn');
      setConfirm(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to withdraw');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Applications</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{apps.length} total</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['', 'pending', 'under_review', 'approved', 'rejected', 'withdrawn'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all capitalize
                ${filter === s
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
            >
              {s === 'under_review' ? 'Under Review' : s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <SkeletonCard key={i} lines={3} />)}</div>
      ) : apps.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No applications found"
          description="You haven't applied to any scholarships yet"
          action={<button onClick={() => navigate('/scholarships')} className="btn-primary">Browse Scholarships</button>}
        />
      ) : (
        <div className="space-y-4">
          {apps.map((app) => {
            const isExpanded = expanded[app._id];
            const uploadedCount = app.documents?.length || 0;
            const requiredCount = app.scholarship?.requiredDocuments?.length || 0;
            const hasRejectedDoc = app.documents?.some((d) => d.status === 'rejected');

            return (
              <div key={app._id} className="card p-5 animate-slide-up">
                {/* Main row */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge status={app.status} />
                      <Badge status={app.scholarship?.type} />
                      {hasRejectedDoc && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                          <AlertCircle className="h-3 w-3" />Doc rejected
                        </span>
                      )}
                    </div>
                    <h3
                      className="font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-indigo-600 dark:hover:text-purple-400 transition-colors"
                      onClick={() => navigate(`/scholarships/${app.scholarship?._id}`)}
                    >
                      {app.scholarship?.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{app.scholarship?.organizationName}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{app.scholarship?.amount?.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Footer row */}
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Applied: {new Date(app.appliedAt).toLocaleDateString()}
                    </span>
                    {requiredCount > 0 && (
                      <span className={`flex items-center gap-1 ${uploadedCount === requiredCount ? 'text-emerald-500' : 'text-amber-500'}`}>
                        <Paperclip className="h-3.5 w-3.5" />
                        {uploadedCount}/{requiredCount} docs
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Expand/collapse documents panel */}
                    {(requiredCount > 0 || uploadedCount > 0) && (
                      <button
                        onClick={() => toggleExpand(app._id)}
                        className="flex items-center gap-1 text-xs text-indigo-600 dark:text-purple-400 hover:underline"
                      >
                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        {isExpanded ? 'Hide' : 'Documents'}
                      </button>
                    )}

                    {['pending', 'under_review'].includes(app.status) && (
                      <button
                        onClick={() => setConfirm(app._id)}
                        className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 transition-colors"
                      >
                        <XCircle className="h-3.5 w-3.5" />Withdraw
                      </button>
                    )}
                  </div>
                </div>

                {/* Approval message */}
                {app.status === 'approved' && (
                  <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-xl">
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                      🎉 Approved! Visit the college office with original documents and bank details for final verification.
                    </p>
                  </div>
                )}

                {/* Admin remark */}
                {app.adminRemark && (
                  <p className="mt-2 text-xs text-gray-400 italic">Remark: {app.adminRemark}</p>
                )}

                {/* Expandable document panel */}
                {isExpanded && (
                  <DocUploadPanel app={app} onUploaded={load} />
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!confirm}
        danger
        title="Withdraw Application"
        message="Are you sure you want to withdraw this application? This cannot be undone."
        onConfirm={handleWithdraw}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}