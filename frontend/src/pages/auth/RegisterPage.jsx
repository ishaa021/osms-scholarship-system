import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { studentRegister, adminRegister } from '../../services/api';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { login } = useAuth();
  const location = useLocation();

  // 👇 role comes from login page
  const role = location.state?.role || 'student';

  const [form, setForm] = useState({
    name: '',
    email: '',
    enrollmentNumber: '',
    institutionName: '',
    phone: '',
    password: ''
  });

  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fn = role === 'admin' ? adminRegister : studentRegister;

      const res = await fn(form);
      const data = res.data;

      const userData = {
        ...(data.admin || data.student),
        userType: role
      };

      login(userData, data.token);
      toast.success('Account created successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">

      {/* 🌞 LIGHT BG */}
      <div
        className="absolute inset-0 -z-10 dark:hidden"
        style={{
          backgroundColor: '#6482ad',
          backgroundImage: `url("https://www.transparenttextures.com/patterns/cartographer.png")`,
        }}
      />

      {/* 🌙 DARK BG */}
      <div
        className="absolute inset-0 -z-10 hidden dark:block"
        style={{
          backgroundColor: '#9483f2',
          backgroundImage: `url("https://www.transparenttextures.com/patterns/cartographer.png")`,
        }}
      />

      {/* 🔥 GLOW */}
      <div className="absolute w-[500px] h-[500px] bg-purple-500/30 blur-[120px] rounded-full top-[-100px] left-[-100px] animate-pulse" />
      <div className="absolute w-[400px] h-[400px] bg-blue-400/20 blur-[100px] rounded-full bottom-[-100px] right-[-100px] animate-pulse" />

      <div className="w-full max-w-md animate-slide-up">

        {/* LOGO */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl mb-3 shadow-xl animate-bounce">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-white drop-shadow">
            Create Account
          </h1>

          <p className="text-sm text-white/80">
            {role === 'admin'
              ? 'Admin registration portal'
              : 'Student registration portal'}
          </p>
        </div>

        {/* CARD */}
        <div className="card p-7 animate-fade-in 
          bg-[#e2dad6]/90 
          dark:bg-dark-secondary/80 
          backdrop-blur-xl 
          border border-white/40 dark:border-gray-700 
          shadow-xl">

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* FULL NAME */}
            <div>
              <label className="label">Full Name</label>
              <input
                className="input"
                placeholder="ABCD"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                required
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                placeholder="you@gmail.com"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                required
              />
            </div>

            {/* 🎯 CONDITIONAL FIELD */}
            {role === 'student' && (
              <div className="animate-fade-in">
                <label className="label">Enrollment Number</label>
                <input
                  className="input"
                  placeholder="0000"
                  value={form.enrollmentNumber}
                  onChange={e => set('enrollmentNumber', e.target.value)}
                  required
                />
              </div>
            )}

            {role === 'admin' && (
              <div className="animate-fade-in">
                <label className="label">Phone Number</label>
                <input
                  className="input"
                  placeholder="0000000000"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  required
                />
              </div>
            )}

            {/* INSTITUTION */}
            <div>
              <label className="label">Institution Name</label>
              <input
                className="input"
                placeholder="ABC College "
                value={form.institutionName}
                onChange={e => set('institutionName', e.target.value)}
                required
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  className="input pr-10"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPass ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 glow"
            >
              {loading
                ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : 'Create Account'}
            </button>
          </form>

          {/* LOGIN LINK */}
          <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-5">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-indigo-600 dark:text-purple-400 font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}