import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMyApplications, getScholarships, getUnreadCount } from '../../services/api';
import StatsCard from '../../components/StatsCard';
import SkeletonCard from '../../components/ui/SkeletonCard';
import Badge from '../../components/ui/Badge';
import { BookOpen, FileText, Bell, Clock, Link as LinkIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getMyApplications(),
      getScholarships({ active: true }),
      getUnreadCount(),
    ]).then(([a, s, n]) => {
      setApps(a.data.applications);
      setScholarships(s.data.scholarships.slice(0, 4));
      setUnread(n.data.unreadCount);
    }).finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Total Applications', value: apps.length,                                icon: FileText, color: 'primary' },
    { label: 'Pending',            value: apps.filter(a => a.status==='pending').length, icon: Clock,    color: 'amber' },
    { label: 'Approved',           value: apps.filter(a => a.status==='approved').length,icon: BookOpen, color: 'green' },
    { label: 'Notifications',      value: unread,                                      icon: Bell,     color: 'purple', sub: 'unread' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
     <div className="bg-gradient-to-r from-gray-900 to-primary-900 dark:from-gray-900 dark:to-gray-800 rounded-2xl p-6 text-white">
        <p className="text-gray-400 text-sm mb-1">Student Panel</p>
        <h1 className="text-2xl font-bold">{user?.name}</h1>
        <p className="text-gray-400 text-sm mt-1">{user?.institutionName}</p>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} lines={2} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(s => <StatsCard key={s.label} {...s} />)}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Recent Applications</h2>
            <button onClick={() => navigate('/my-applications')} className="text-xs text-primary-600 dark:text-primary-400 hover:underline">View all</button>
          </div>
          {loading ? <SkeletonCard lines={3} /> : apps.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No applications yet</p>
          ) : (
            <div className="space-y-3">
              {apps.slice(0, 5).map(app => (
                <div key={app._id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{app.scholarship?.title}</p>
                    <p className="text-xs text-gray-400">{new Date(app.appliedAt).toLocaleDateString()}</p>
                  </div>
                  <Badge status={app.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Scholarships */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Available Now</h2>
            <button onClick={() => navigate('/scholarships')} className="text-xs text-primary-600 dark:text-primary-400 hover:underline">Browse all</button>
          </div>
          {loading ? <SkeletonCard lines={3} /> : scholarships.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No scholarships available</p>
          ) : (
            <div className="space-y-3">
              {scholarships.map(s => (
                <div key={s._id} onClick={() => navigate(`/scholarships/${s._id}`)}
                  className="flex items-center gap-3 py-2 border-b border-gray-50 dark:border-gray-800 last:border-0 cursor-pointer group">
                  <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex-shrink-0">
                    {s.type === 'external' ? <LinkIcon className="h-3.5 w-3.5 text-primary-500" /> : <BookOpen className="h-3.5 w-3.5 text-primary-500" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-primary-600 transition-colors">{s.title}</p>
                    <p className="text-xs text-gray-400">₹{s.amount?.toLocaleString()} • Due {new Date(s.deadline).toLocaleDateString()}</p>
                  </div>
                  <Badge status={s.type} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}