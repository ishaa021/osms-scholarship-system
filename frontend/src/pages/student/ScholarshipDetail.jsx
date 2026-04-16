import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getScholarshipById, applyForScholarship, uploadDocuments } from '../../services/api';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import {
  Calendar, Building2, FileText, ExternalLink,
  ArrowLeft, CheckCircle, Upload, X, Paperclip
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ScholarshipDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [s, setS]             = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep]       = useState('detail'); // 'detail' | 'upload'
  const [applying, setApplying] = useState(false);

  // Document upload state
  const [applicationId, setApplicationId] = useState(null);
  const [docFiles, setDocFiles]           = useState({}); // { docName: File }
  const [uploading, setUploading]         = useState(false);

  useEffect(() => {
    getScholarshipById(id)
      .then((r) => setS(r.data.scholarship))
      .catch(() => toast.error('Scholarship not found'))
      .finally(() => setLoading(false));
  }, [id]);

  // Step 1: Create the application record
  const handleApply = async () => {
    setApplying(true);
    try {
      const res = await applyForScholarship(id);
      setApplicationId(res.data.application._id);
      // If scholarship requires docs, go to upload step; otherwise done
      if (s.requiredDocuments?.length > 0) {
        setStep('upload');
        toast.success('Application created! Now upload your documents.');
      } else {
        toast.success('Application submitted successfully!');
        navigate('/my-applications');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Application failed');
    } finally {
      setApplying(false);
    }
  };

  // Handle file selection per document slot
  const handleFileSelect = (docName, file) => {
    if (!file) return;
    setDocFiles((prev) => ({ ...prev, [docName]: file }));
  };

  // Remove a selected file
  const removeFile = (docName) => {
    setDocFiles((prev) => {
      const next = { ...prev };
      delete next[docName];
      return next;
    });
  };

  // Step 2: Upload all selected documents
  const handleUploadDocs = async () => {
    const selectedFiles = Object.entries(docFiles);
    if (selectedFiles.length === 0) {
      return toast.error('Please select at least one document');
    }
    setUploading(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach(([, file]) => {
        formData.append('files', file);
      });
      await uploadDocuments(applicationId, formData);
      toast.success('Documents uploaded! Your application is under review.');
      navigate('/my-applications');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Skip upload — application stays pending
  const handleSkipUpload = () => {
    toast.success('Application submitted. You can upload documents from My Applications.');
    navigate('/my-applications');
  };

  if (loading) return <div className="py-20"><Spinner size="lg" /></div>;
  if (!s)     return <div className="text-center py-20 text-gray-500">Scholarship not found.</div>;

  const isExpired = new Date(s.deadline) < new Date();

  // ── DOCUMENT UPLOAD STEP ──────────────────────────────
  if (step === 'upload') {
    return (
      <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
        <button onClick={() => navigate('/my-applications')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Applications
        </button>

        <div className="card p-7">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
              <Upload className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Upload Documents</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{s.title}</p>
            </div>
          </div>

          {/* Info banner */}
          <div className="mt-4 mb-6 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-xl">
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Upload clear, readable files. Accepted formats: <strong>JPG, PNG, PDF</strong> (max 5MB each).
            </p>
          </div>

          {/* Document upload slots */}
          <div className="space-y-4">
            {s.requiredDocuments.map((docName) => {
              const file = docFiles[docName];
              return (
                <div key={docName} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`h-4 w-4 ${file ? 'text-emerald-500' : 'text-gray-300 dark:text-gray-600'}`} />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{docName}</span>
                    </div>
                    {file && (
                      <button onClick={() => removeFile(docName)} className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {file ? (
                    // File selected — show preview info
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/20 rounded-lg">
                      <Paperclip className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 truncate">{file.name}</p>
                        <p className="text-xs text-emerald-500 dark:text-emerald-500">{(file.size / 1024).toFixed(0)} KB</p>
                      </div>
                    </div>
                  ) : (
                    // No file — show upload area
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all">
                      <Upload className="h-5 w-5 text-gray-300 dark:text-gray-600 mb-1" />
                      <p className="text-xs text-gray-400 dark:text-gray-500">Click to upload</p>
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

          {/* Progress indicator */}
          <div className="mt-4 mb-6">
            <div className="flex justify-between text-xs text-gray-400 mb-1.5">
              <span>{Object.keys(docFiles).length} of {s.requiredDocuments.length} documents selected</span>
              <span>{Math.round((Object.keys(docFiles).length / s.requiredDocuments.length) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${(Object.keys(docFiles).length / s.requiredDocuments.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button onClick={handleSkipUpload} className="btn-secondary flex-1 justify-center">
              Skip for now
            </button>
            <button
              onClick={handleUploadDocs}
              disabled={uploading || Object.keys(docFiles).length === 0}
              className="btn-primary flex-1 justify-center"
            >
              {uploading
                ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Upload className="h-4 w-4" />Upload & Submit</>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── DETAIL STEP (unchanged layout) ───────────────────
  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="card p-7">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge status={s.type} />
              {isExpired && <span className="badge-rejected">Expired</span>}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{s.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{s.organizationName}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">₹{s.amount?.toLocaleString()}</p>
            <p className="text-sm text-gray-400">Scholarship Amount</p>
          </div>
        </div>

        {/* Meta grid */}
        <div className="grid sm:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl mb-6">
          <div className="flex items-center gap-2.5 text-sm">
            <Calendar className="h-4 w-4 text-amber-500 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Deadline</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {new Date(s.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-sm">
            <Building2 className="h-4 w-4 text-indigo-500 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Institution</p>
              <p className="font-medium text-gray-900 dark:text-white">{s.institution}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <section className="mb-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{s.description}</p>
        </section>

        {/* Eligibility */}
        <section className="mb-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-2">Eligibility</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{s.eligibility}</p>
        </section>

        {/* Required docs */}
        {s.requiredDocuments?.length > 0 && (
          <section className="mb-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Required Documents</h2>
            <ul className="space-y-2">
              {s.requiredDocuments.map((doc, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  {doc}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Apply button */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
          {s.type === 'external' ? (
            <a href={s.applyUrl} target="_blank" rel="noopener noreferrer" className="btn-primary w-full justify-center py-3">
              <ExternalLink className="h-4 w-4" />
              Apply on External Website
            </a>
          ) : isExpired ? (
            <button disabled className="btn-primary w-full justify-center py-3 opacity-50 cursor-not-allowed">
              Deadline Passed
            </button>
          ) : (
            <button onClick={handleApply} disabled={applying} className="btn-primary w-full justify-center py-3">
              {applying
                ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><FileText className="h-4 w-4" />Apply Now</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
