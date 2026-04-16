import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NotFound() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center animate-slide-up">
        <p className="text-8xl font-black text-primary-100 dark:text-primary-900/30 mb-4">404</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Page not found</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">The page you're looking for doesn't exist.</p>
        <button onClick={() => navigate(user ? (isAdmin ? '/admin/dashboard' : '/dashboard') : '/login')}
          className="btn-primary">Go Home</button>
      </div>
    </div>
  );
}