import { useEffect, useState } from 'react';
import { getScholarshipStats, getApplicationStats } from '../../services/api';
import StatsCard from '../../components/StatsCard';
import SkeletonCard from '../../components/ui/SkeletonCard';
import { BookOpen, FileText, CheckCircle, XCircle, Clock, TrendingUp, Award, Users } from 'lucide-react';

export default function Analytics() {
  const [schStats, setSchStats] = useState(null);
  const [appStats, setAppStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getScholarshipStats(), getApplicationStats()])
      .then(([s, a]) => { setSchStats(s.data); setAppStats(a.data); })
      .finally(() => setLoading(false));
  }, []);

  const approvalRate = appStats?.total > 0
    ? Math.round((appStats.approved / appStats.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-1000 dark:text-white">Analytics</h1>
        <p className="text-sm text-gray-1000 dark:text-gray-400 mt-0.5">Overview of your institution's scholarship activity</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(8)].map((_, i) => <SkeletonCard key={i} lines={2} />)}</div>
      ) : (
        <>
          <div>
            <h2 className="text-sm font-semibold text-gray-1000 uppercase tracking-wider mb-3">Scholarship Overview</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard label="Total Scholarships" value={schStats?.total}    icon={BookOpen}  color="primary" />
              <StatsCard label="Internal"            value={schStats?.internal} icon={Award}     color="blue" />
              <StatsCard label="External"            value={schStats?.external} icon={TrendingUp} color="purple" />
              <StatsCard label="Active"              value={schStats?.active}   icon={CheckCircle} color="green" />
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-1000 uppercase tracking-wider mb-3">Application Overview</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard label="Total Applications" value={appStats?.total}     icon={FileText}    color="primary" />
              <StatsCard label="Pending Review"     value={appStats?.pending}   icon={Clock}       color="amber" />
              <StatsCard label="Approved"           value={appStats?.approved}  icon={CheckCircle} color="green" />
              <StatsCard label="Rejected"           value={appStats?.rejected}  icon={XCircle}     color="red" />
            </div>
          </div>

          {/* Approval rate bar */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Approval Rate</h3>
                <p className="text-sm text-gray-900 mt-0.5">Based on all decided applications</p>
              </div>
              <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">{approvalRate}%</span>
            </div>
            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary-500 to-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${approvalRate}%` }} />
            </div>
            <div className="flex justify-between text-xs text-gray-1000 dark:text-gray-400 mt-2">
              <span>{appStats?.approved} approved</span>
              <span>{appStats?.rejected} rejected</span>
            </div>
          </div>

          {/* Distribution */}
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Application Distribution</h3>
              {[
                { label: 'Pending',   val: appStats?.pending,   max: appStats?.total, color: 'bg-amber-500' },
                { label: 'Approved',  val: appStats?.approved,  max: appStats?.total, color: 'bg-emerald-500' },
                { label: 'Rejected',  val: appStats?.rejected,  max: appStats?.total, color: 'bg-red-500' },
                { label: 'Withdrawn', val: appStats?.withdrawn, max: appStats?.total, color: 'bg-gray-400' },
              ].map(({ label, val, max, color }) => (
                <div key={label} className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">{label}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{val ?? 0}</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all duration-500`}
                      style={{ width: max ? `${((val ?? 0) / max) * 100}%` : '0%' }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Scholarship Types</h3>
              {[
                { label: 'Internal', val: schStats?.internal, max: schStats?.total, color: 'bg-primary-500' },
                { label: 'External', val: schStats?.external, max: schStats?.total, color: 'bg-purple-500' },
                { label: 'Active',   val: schStats?.active,   max: schStats?.total, color: 'bg-emerald-500' },
              ].map(({ label, val, max, color }) => (
                <div key={label} className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">{label}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{val ?? 0}</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all duration-500`}
                      style={{ width: max ? `${((val ?? 0) / max) * 100}%` : '0%' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}