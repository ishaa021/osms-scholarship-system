import { useEffect, useState } from 'react';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '../../services/api';
import EmptyState from '../../components/ui/EmptyState';
import SkeletonCard from '../../components/ui/SkeletonCard';
import { Bell, CheckCheck, Trash2, CheckCircle, XCircle, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const typeIcon = { application_approved: CheckCircle, application_rejected: XCircle, new_application: Bell, general: Info };
const typeColor = { application_approved: 'text-emerald-500', application_rejected: 'text-red-500', new_application: 'text-primary-500', general: 'text-gray-400' };

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => getNotifications().then(r => setNotifs(r.data.notifications)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleRead = async (id) => {
    await markAsRead(id);
    setNotifs(n => n.map(x => x._id === id ? { ...x, isRead: true } : x));
  };

  const handleReadAll = async () => {
    await markAllAsRead();
    setNotifs(n => n.map(x => ({ ...x, isRead: true })));
    toast.success('All marked as read');
  };

  const handleDelete = async (id) => {
    await deleteNotification(id);
    setNotifs(n => n.filter(x => x._id !== id));
  };

  const unreadCount = notifs.filter(n => !n.isRead).length;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-sm text-gray-900 dark:text-gray-400 mt-0.5">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleReadAll} className="btn-secondary gap-1.5 text-xs">
            <CheckCheck className="h-3.5 w-3.5" /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <SkeletonCard key={i} lines={2} />)}</div>
      ) : notifs.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" />
      ) : (
        <div className="space-y-2">
          {notifs.map(n => {
            const Icon = typeIcon[n.type] || Info;
            return (
              <div key={n._id} onClick={() => !n.isRead && handleRead(n._id)}
                className={`card p-4 flex items-start gap-4 cursor-pointer transition-all duration-200 ${!n.isRead ? 'border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/10' : ''}`}>
                <div className={`p-2 rounded-lg flex-shrink-0 ${!n.isRead ? 'bg-primary-100 dark:bg-primary-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                  <Icon className={`h-4 w-4 ${typeColor[n.type] || 'text-gray-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-relaxed ${!n.isRead ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                    {n.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!n.isRead && <div className="h-2 w-2 rounded-full bg-primary-500" />}
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(n._id); }}
                    className="p-1.5 text-gray-300 hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}