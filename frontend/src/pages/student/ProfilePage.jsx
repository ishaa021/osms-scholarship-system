import { useAuth } from '../../context/AuthContext';
import { User, Mail, Hash, Building2, Calendar, LogOut } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout } = useAuth();

  const fields = [
    { icon: User,     label: 'Full Name',          value: user?.name },
    { icon: Mail,     label: 'Email',               value: user?.email },
    { icon: Hash,     label: 'Enrollment Number',   value: user?.enrollmentNumber },
    { icon: Building2,label: 'Institution',         value: user?.institutionName },
    { icon: Calendar, label: 'Member Since',        value: new Date(user?.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) },
  ];

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Profile</h1>

      <div className="card p-6">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-primary-500/25">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{user?.name}</h2>
            <span className="badge-internal capitalize">{user?.userType || 'student'}</span>
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          {fields.map(({ icon: Icon, label, value }) => value && (
            <div key={label} className="flex items-center gap-4 py-2">
              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg flex-shrink-0">
                <Icon className="h-4 w-4 text-primary-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={logout} className="btn-danger w-full justify-center py-3">
        <LogOut className="h-4 w-4" /> Sign Out
      </button>
    </div>
  );
}