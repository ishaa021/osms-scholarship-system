import { useEffect, useState } from 'react';
import { getAllApplications, updateAppStatus, updateDocStatus, getAppWithDocs } from '../../services/api';
import Badge from '../../components/ui/Badge';
import SkeletonCard from '../../components/ui/SkeletonCard';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import {
  ShieldCheck, CheckCircle, XCircle, FileText, ExternalLink,
  ChevronDown, ChevronUp, Paperclip, Eye, AlertCircle, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// ── Doc status badge ──────────────────────────────────────
function DocStatusBadge({ status }) {
  const map = {
    pending:  { cls: 'badge-pending',  icon: Clock },
    verified: { cls: 'badge-approved', icon: CheckCircle },
    rejected: { cls: 'badge-rejected', icon: XCircle },
  };
  const { cls, icon: Icon } = map[status] || map.pending;
  return (
    <span className={`${cls} gap-1`}>
      <Icon className="h-3 w-3" />{status}
    </span>
  );
}

// ── Per-application document review panel ─────────────────
function DocReviewPanel({ app, onUpdate }) {
  const [processing, setProcessing] = useState(null); // docId+action
  const [finalProcessing, setFinalProcessing] = useState(null);
  const [remark, setRemark] = useState('');
  const [confirmAction, setConfirmAction] = useState(null); // 'approved' | 'rejected'

  // Per-doc action
  const handleDocAction = async (docId, status, note = '') => {
    setProcessing(docId + status);
    try {
      await updateDocStatus(app._id, docId, { status, adminNote: note });
      toast.success(`Document ${status}`);
      onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update document');
    } finally {
      setProcessing(null);
    }
  };

  // Final application decision
  const handleFinalDecision = async () => {
    setFinalProcessing(confirmAction);
    try {
      await updateAppStatus(app._id, { status: confirmAction, adminRemark: remark });
      toast.success(`Application ${confirmAction}`);
      setConfirmAction(null);
      onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setFinalProcessing(null);
    }
  };

  const docs = app.documents || [];
  const allVerified = docs.length > 0 && docs.every((d) => d.status === 'verified');
  const anyRejected = docs.some((d) => d.status === 'rejected');
  const canDecide = !['approved', 'rejected'].includes(app.status);

  return (
    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-4">

      {/* No documents uploaded yet */}
      {docs.length === 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-xl">
          <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            Student has not uploaded documents yet.
          </p>
        </div>
      )}

      {/* Document list */}
      {docs.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-900 dark:text-gray-500 uppercase tracking-wider mb-3">
            Uploaded Documents ({docs.length})
          </p>
          <div className="space-y-3">
            {docs.map((doc) => (
              <div key={doc._id} className="border border-gray-100 dark:border-gray-800 rounded-xl p-4 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg flex-shrink-0">
                      <Paperclip className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{doc.name}</p>
                      {doc.adminNote && (
                        <p className="text-xs text-red-500 mt-0.5">{doc.adminNote}</p>
                      )}
                    </div>
                  </div>

                  {/* Status + actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <DocStatusBadge status={doc.status} />

                    {/* View file */}
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-gray-400 hover:text-indigo-500 transition-colors rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                      title="View document"
                    >
                      <Eye className="h-4 w-4" />
                    </a>

                    {/* Verify button */}
                    {doc.status !== 'verified' && canDecide && (
                      <button
                        onClick={() => handleDocAction(doc._id, 'verified')}
                        disabled={!!processing}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all active:scale-95 disabled:opacity-50"
                      >
                        {processing === doc._id + 'verified'
                          ? <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          : <><CheckCircle className="h-3 w-3" />Verify</>}
                      </button>
                    )}

                    {/* Reject button */}
                    {doc.status !== 'rejected' && canDecide && (
                      <button
                        onClick={() => handleDocAction(doc._id, 'rejected')}
                        disabled={!!processing}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all active:scale-95 disabled:opacity-50"
                      >
                        {processing === doc._id + 'rejected'
                          ? <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          : <><XCircle className="h-3 w-3" />Reject</>}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Final decision — only for pending/under_review */}
      {canDecide && (
        <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Final Decision</p>

          {/* Status summary */}
          {docs.length > 0 && (
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {allVerified && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">
                  <CheckCircle className="h-3 w-3" />All documents verified
                </span>
              )}
              {anyRejected && (
                <span className="inline-flex items-center gap-1 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-lg">
                  <XCircle className="h-3 w-3" />Some documents rejected
                </span>
              )}
            </div>
          )}

          <input
            className="input text-sm mb-3"
            placeholder="Remark (optional — shown to student on rejection)"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
          />

          <div className="flex gap-3">
            <button
              onClick={() => setConfirmAction('approved')}
              disabled={!!finalProcessing}
              className="btn-primary flex-1 justify-center bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
            >
              {finalProcessing === 'approved'
                ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><CheckCircle className="h-4 w-4" />Approve Application</>}
            </button>
            <button
              onClick={() => setConfirmAction('rejected')}
              disabled={!!finalProcessing}
              className="btn-danger flex-1 justify-center"
            >
              {finalProcessing === 'rejected'
                ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><XCircle className="h-4 w-4" />Reject Application</>}
            </button>
          </div>
        </div>
      )}

      {/* Confirm dialog for final decision */}
      <ConfirmDialog
        open={!!confirmAction}
        danger={confirmAction === 'rejected'}
        title={confirmAction === 'approved' ? 'Approve Application' : 'Reject Application'}
        message={
          confirmAction === 'approved'
            ? 'This will approve the application and notify the student to visit the office.'
            : 'This will reject the application. The student will be notified.'
        }
        onConfirm={handleFinalDecision}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function VerifyDocuments() {
  const navigate = useNavigate();
  const [apps, setApps]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('under_review'); // default — show actionable ones
  const [expanded, setExpanded] = useState({});

  const load = () => {
    setLoading(true);
    const params = filter ? { status: filter } : {};
    getAllApplications(params)
      .then((r) => setApps(r.data.applications))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const toggleExpand = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Verify Documents</h1>
        <p className="text-sm text-gray-900 dark:text-gray-400 mt-0.5">
          Review uploaded documents and approve or reject applications
        </p>
      </div>

      {/* Info banner */}
      <div className="card p-4 bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/20">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-400">Verification workflow</p>
            <p className="text-sm text-amber-600 dark:text-amber-500 mt-0.5">
              Verify each uploaded document individually, then make a final Approve or Reject decision.
              Approved students receive an automatic notification to visit the college office.
            </p>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { val: 'under_review', label: 'Under Review' },
          { val: 'pending',      label: 'Pending' },
          { val: 'approved',     label: 'Approved' },
          { val: 'rejected',     label: 'Rejected' },
          { val: '',             label: 'All' },
        ].map(({ val, label }) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all
              ${filter === val
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Applications */}
      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <SkeletonCard key={i} lines={4} />)}</div>
      ) : apps.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No applications found"
          description={filter === 'under_review' ? 'No applications pending document review' : 'No applications match this filter'}
          action={filter !== '' ? <button onClick={() => setFilter('')} className="btn-secondary">Show all</button> : null}
        />
      ) : (
        <div className="space-y-4">
          {apps.map((app) => {
            const isExpanded = expanded[app._id];
            const docCount = app.documents?.length || 0;
            const verifiedCount = app.documents?.filter((d) => d.status === 'verified').length || 0;
            const rejectedCount = app.documents?.filter((d) => d.status === 'rejected').length || 0;

            return (
              <div key={app._id} className="card p-5 animate-slide-up">
                {/* Top row */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <Badge status={app.status} />
                      <Badge status={app.scholarship?.type} />
                      {docCount > 0 && (
                        <span className="text-xs text-gray-400">
                          {verifiedCount}✓ {rejectedCount > 0 ? `${rejectedCount}✗` : ''} / {docCount} docs
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{app.scholarship?.title}</h3>

                    {/* Student info */}
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {app.student?.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-900 dark:text-white">{app.student?.name}</span>
                        <span className="text-gray-400 mx-1.5">·</span>
                        <span className="text-gray-400 text-xs">{app.student?.enrollmentNumber}</span>
                        <span className="text-gray-400 mx-1.5">·</span>
                        <span className="text-gray-400 text-xs">{app.student?.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">
                      ₹{app.scholarship?.amount?.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">{new Date(app.appliedAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Expand toggle */}
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {docCount === 0 && (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                        <AlertCircle className="h-3.5 w-3.5" />No documents uploaded
                      </span>
                    )}
                    {docCount > 0 && verifiedCount === docCount && (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="h-3.5 w-3.5" />All verified
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => toggleExpand(app._id)}
                    className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-purple-400 hover:underline"
                  >
                    {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    {isExpanded ? 'Hide Details' : 'Review Documents'}
                  </button>
                </div>

                {/* Expandable doc review panel */}
                {isExpanded && (
                  <DocReviewPanel app={app} onUpdate={load} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
