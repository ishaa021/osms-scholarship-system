import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
});

// Auto-attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('osms_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global 401 handler
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('osms_token');
      localStorage.removeItem('osms_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth  ───────────────────────────────────────
export const adminRegister   = (data) => api.post('/auth/admin/register', data);
export const adminLogin      = (data) => api.post('/auth/admin/login', data);
export const studentRegister = (data) => api.post('/auth/student/register', data);
export const studentLogin    = (data) => api.post('/auth/student/login', data);
export const getMyProfile    = ()     => api.get(`/auth/${getUserType()}/me`);

// ── OTP Auth  ────────────────────────────────────────
export const sendOTP   = (data) => api.post('/auth/otp/send', data);
export const verifyOTP = (data) => api.post('/auth/otp/verify', data);

// ── Scholarships  ───────────────────────────────
export const getScholarships     = (params)    => api.get('/scholarships', { params });
export const getScholarshipById  = (id)        => api.get(`/scholarships/${id}`);
export const createScholarship   = (data)      => api.post('/scholarships', data);
export const updateScholarship   = (id, data)  => api.patch(`/scholarships/${id}`, data);
export const deleteScholarship   = (id)        => api.delete(`/scholarships/${id}`);
export const getScholarshipStats = ()          => api.get('/scholarships/stats');

// ── Applications  ───────────────────────────────
export const applyForScholarship = (scholarshipId) => api.post('/applications', { scholarshipId });
export const getMyApplications   = (params)        => api.get('/applications/my', { params });
export const getAllApplications  = (params)        => api.get('/applications', { params });
export const updateAppStatus     = (id, data)      => api.patch(`/applications/${id}`, data);
export const withdrawApplication = (id)            => api.patch(`/applications/${id}/withdraw`);
export const getApplicationStats = ()              => api.get('/applications/stats');

// ── Document Upload  ─────────────────────────────────
// formData must be a FormData object with files appended under field "files"
export const uploadDocuments = (applicationId, formData) =>
  api.post(`/upload/documents/${applicationId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// Admin: verify or reject a single document
// data = { status: 'verified' | 'rejected', adminNote?: string }
export const updateDocStatus = (applicationId, documentId, data) =>
  api.patch(`/upload/documents/${applicationId}/${documentId}`, data);

// Admin: get single application with documents
export const getAppWithDocs = (id) => api.get(`/upload/application/${id}`);

// ── Notifications  ──────────────────────────────
export const getNotifications   = ()    => api.get('/notifications');
export const getUnreadCount     = ()    => api.get('/notifications/unread-count');
export const markAsRead         = (id)  => api.patch(`/notifications/${id}/read`);
export const markAllAsRead      = ()    => api.patch('/notifications/read-all');
export const deleteNotification = (id)  => api.delete(`/notifications/${id}`);

// Helper
function getUserType() {
  const user = JSON.parse(localStorage.getItem('osms_user') || '{}');
  return user.userType || 'student';
}

export default api;