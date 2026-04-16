import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

// Auth
import LoginPage    from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Student
import StudentDashboard  from './pages/student/Dashboard';
import BrowseScholarships from './pages/student/BrowseScholarships';
import ScholarshipDetail  from './pages/student/ScholarshipDetail';
import MyApplications     from './pages/student/MyApplications';
import NotificationsPage  from './pages/student/NotificationsPage';
import ProfilePage        from './pages/student/ProfilePage';

// Admin
import AdminDashboard     from './pages/admin/AdminDashboard';
import AddScholarship     from './pages/admin/AddScholarship';
import ManageScholarships from './pages/admin/ManageScholarships';
import ViewApplications   from './pages/admin/ViewApplications';
import VerifyDocuments    from './pages/admin/VerifyDocuments';
import Analytics          from './pages/admin/Analytics';
import AdminNotifications from './pages/student/NotificationsPage'; // reused

import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Toaster position="top-right" toastOptions={{
            className: 'dark:bg-gray-800 dark:text-white dark:border-gray-700',
            style: { borderRadius: '10px', fontSize: '14px' },
          }} />
          <Routes>
            {/* Public */}
            <Route path="/"        element={<Navigate to="/login" replace />} />
            <Route path="/login"   element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Student protected */}
            <Route element={<ProtectedRoute role="student"><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard"       element={<StudentDashboard />} />
              <Route path="/scholarships"    element={<BrowseScholarships />} />
              <Route path="/scholarships/:id" element={<ScholarshipDetail />} />
              <Route path="/my-applications" element={<MyApplications />} />
              <Route path="/notifications"   element={<NotificationsPage />} />
              <Route path="/profile"         element={<ProfilePage />} />
            </Route>

            {/* Admin protected */}
            <Route element={<ProtectedRoute role="admin"><AppLayout /></ProtectedRoute>}>
              <Route path="/admin/dashboard"       element={<AdminDashboard />} />
              <Route path="/admin/add-scholarship" element={<AddScholarship />} />
              <Route path="/admin/scholarships"    element={<ManageScholarships />} />
              <Route path="/admin/applications"    element={<ViewApplications />} />
              <Route path="/admin/verify-docs"     element={<VerifyDocuments />} />
              <Route path="/admin/analytics"       element={<Analytics />} />
              <Route path="/admin/notifications"   element={<AdminNotifications />} />
              <Route path="/scholarships/:id"      element={<ScholarshipDetail />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}