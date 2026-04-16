import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getScholarshipStats, getApplicationStats, getAllApplications } from '../../services/api';
import StatsCard from '../../components/StatsCard';
import SkeletonCard from '../../components/ui/SkeletonCard';
import Badge from '../../components/ui/Badge';
import { BookOpen, FileText, Clock, CheckCircle, XCircle, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [schStats, setSchStats] = useState(null);
  const [appStats, setAppStats] = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getScholarshipStats(),
      getApplicationStats(),
      getAllApplications({ status: 'pending' }),
    ]).then(([ss, as, ra]) => {
      setSchStats(ss.data);
      setAppStats(as.data);
      setRecentApps(ra.data.applications.slice(0, 6));
    }).finally(() => setLoading(false));
  }, []);
 if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <SkeletonCard key={i} lines={2} />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="bg-gradient-to-r from-gray-900 to-primary-900 dark:from-gray-900 dark:to-gray-800 rounded-2xl p-6 text-white">
        <p className="text-gray-400 text-sm mb-1">Admin Panel</p>
        <h1 className="text-2xl font-bold">{user?.name}</h1>
        <p className="text-gray-400 text-sm mt-1">{user?.institutionName}</p>
      </div>

      {/* Scholarship stats */}
      <div>
        <h2 className="text-sm font-bold text-gray-1000 dark:text-gray-400 uppercase tracking-wider mb-3">Scholarships</h2>
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <SkeletonCard key={i} lines={2} />)}</div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard label="Total"    value={schStats?.total}    icon={BookOpen}      color="primary" />
            <StatsCard label="Internal" value={schStats?.internal}  icon={GraduationCap} color="blue" />
            <StatsCard label="External" value={schStats?.external}  icon={FileText}      color="purple" />
            <StatsCard label="Active"   value={schStats?.active}    icon={CheckCircle}   color="green" />
          </div>
        )}
      </div>

      {/* Application stats */}
      <div>
        <h2 className="text-sm font-semibold text-gray-1000 dark:text-gray-400 uppercase tracking-wider mb-3">Applications</h2>
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <SkeletonCard key={i} lines={2} />)}</div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard label="Total"     value={appStats?.total}     icon={FileText}    color="primary" />
            <StatsCard label="Pending"   value={appStats?.pending}   icon={Clock}       color="amber" />
            <StatsCard label="Approved"  value={appStats?.approved}  icon={CheckCircle} color="green" />
            <StatsCard label="Rejected"  value={appStats?.rejected}  icon={XCircle}     color="red" />
          </div>
        )}
      </div>

      {/* Pending applications */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Pending Review</h2>
          <button onClick={() => navigate('/admin/applications')} className="text-xs text-primary-600 dark:text-primary-400 hover:underline">View all</button>
        </div>
        {loading ? <SkeletonCard lines={4} /> : recentApps.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No pending applications</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  {['Student', 'Scholarship', 'Amount', 'Applied', 'Status'].map(h => (
                    <th key={h} className="pb-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {recentApps.map(app => (
                  <tr key={app._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                    onClick={() => navigate('/admin/applications')}>
                    <td className="py-3 pr-4">
                      <p className="font-medium text-gray-900 dark:text-white">{app.student?.name}</p>
                      <p className="text-xs text-gray-400">{app.student?.enrollmentNumber}</p>
                    </td>
                    <td className="py-3 pr-4 max-w-[160px]"><p className="truncate text-gray-700 dark:text-gray-300">{app.scholarship?.title}</p></td>
                    <td className="py-3 pr-4 text-emerald-600 dark:text-emerald-400 font-medium">₹{app.scholarship?.amount?.toLocaleString()}</td>
                    <td className="py-3 pr-4 text-gray-400 text-xs">{new Date(app.appliedAt).toLocaleDateString()}</td>
                    <td className="py-3"><Badge status={app.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}