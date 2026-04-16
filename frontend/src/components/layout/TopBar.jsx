import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { getUnreadCount } from '../../services/api';
import { useNavigate, useLocation } from 'react-router-dom';

export default function TopBar({ onMenuClick }) {
  const { user, isAdmin } = useAuth();
  const [unread, setUnread] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    getUnreadCount()
      .then(r => setUnread(r.data.unreadCount))
      .catch(() => {});
  }, []);

  const notifPath = isAdmin ? '/admin/notifications' : '/notifications';

  // 🔥 Dynamic page title
  const getTitle = () => {
    if (location.pathname.includes('admin')) return 'Admin Dashboard';
    return 'Dashboard';
  };

  return (
    <header
      className="
        sticky top-0 z-20 h-16 
        backdrop-blur-xl 
        bg-white/30 dark:bg-black/20
        border-b border-white/30 dark:border-white/10
        shadow-sm
        flex items-center justify-between px-4 lg:px-6
      "
    >

      {/* LEFT */}
      <div className="flex items-center gap-3">

        {/* MENU BUTTON */}
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 transition"
        >
          <Menu className="h-5 w-5 text-gray-800 dark:text-white" />
        </button>

        {/* 🔥 MOBILE TITLE */}
        <p className="text-sm font-semibold text-gray-800 dark:text-white lg:hidden">
          {getTitle()}
        </p>

        {/* DESKTOP WELCOME */}
        <div className="hidden lg:block">
          <p className="text-sm text-gray-700 dark:text-white/80">
            Welcome back,{' '}
            <span className="font-semibold text-gray-900 dark:text-white">
              {user?.name}
            </span>
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-2">

        {/* NOTIFICATION */}
        <button
          onClick={() => navigate(notifPath)}
          className="
            relative p-2 rounded-lg 
            hover:bg-white/20 dark:hover:bg-white/10 
            transition-all duration-200
          "
        >
          <Bell className="h-5 w-5 text-gray-800 dark:text-white" />

          {unread > 0 && (
            <span className="
              absolute top-1 right-1 
              h-4 w-4 bg-red-500 
              rounded-full text-[10px] text-white 
              flex items-center justify-center font-bold
              animate-pulse
            ">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

      </div>
    </header>
  );
}