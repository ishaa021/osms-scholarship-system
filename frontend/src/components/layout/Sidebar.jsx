import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard, BookOpen, FileText, Bell, User,
  PlusCircle, BarChart2, LogOut, GraduationCap,
  Sun, Moon, X, ShieldCheck
} from 'lucide-react';

const studentLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/scholarships', icon: BookOpen, label: 'Browse Scholarships' },
  { to: '/my-applications', icon: FileText, label: 'My Applications' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const adminLinks = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/add-scholarship', icon: PlusCircle, label: 'Add Scholarship' },
  { to: '/admin/scholarships', icon: BookOpen, label: 'Manage Scholarships' },
  { to: '/admin/applications', icon: FileText, label: 'Applications' },
  { to: '/admin/verify-docs', icon: ShieldCheck, label: 'Verify Documents' },
  { to: '/admin/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/admin/notifications', icon: Bell, label: 'Notifications' },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout, isAdmin } = useAuth();
  const { dark, toggle } = useTheme();
  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 z-30 flex flex-col
          bg-[#6482ad]
          dark:bg-gradient-to-b dark:from-[#3F3B6C] dark:via-[#624F82] dark:to-[#9F73AB]
          text-white
          transform transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        `}
      >
        {/* LOGO */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">OSMS</p>
              <p className="text-xs text-white/70 capitalize">
                {isAdmin ? 'Admin Panel' : 'Student Portal'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden text-white/70 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* USER INFO */}
        <div className="px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold backdrop-blur">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-white/70 truncate">
                {user?.institutionName}
              </p>
            </div>
          </div>
        </div>

        {/* NAV LINKS */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-300
                ${isActive
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg scale-[1.02]'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'}
              `}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* BOTTOM ACTIONS */}
        <div className="px-3 py-4 border-t border-white/10 space-y-1">

          {/* DARK MODE TOGGLE */}
          <button
            onClick={toggle}
            className="flex items-center gap-3 px-3 py-2.5 w-full text-white/70 hover:bg-white/10 hover:text-white rounded-lg text-sm font-medium transition-all"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {dark ? 'Light Mode' : 'Dark Mode'}
          </button>

          {/* LOGOUT */}
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 w-full text-white/70 hover:bg-red-500/20 hover:text-red-300 rounded-lg text-sm font-medium transition-all"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>

        </div>
      </aside>
    </>
  );
}