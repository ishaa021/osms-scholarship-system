import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminLogin, studentLogin, sendOTP, verifyOTP } from '../../services/api';
import { GraduationCap, Eye, EyeOff, Mail, KeyRound, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

// ── OTP countdown hook ────────────────────────────────────
function useCountdown(initial = 0) {
  const [seconds, setSeconds] = useState(initial);
  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);
  const start = (s = 60) => setSeconds(s);
  return { seconds, start, active: seconds > 0 };
}

export default function LoginPage() {
  const { login } = useAuth();

  // role: 'student' | 'admin'
  const [role, setRole] = useState('student');
  // loginMode: 'password' | 'otp'
  const [loginMode, setLoginMode] = useState('password');

  // ── Password form state ───────────────────────────────
  const [form, setForm]         = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  // ── OTP form state ────────────────────────────────────
  const [otpEmail, setOtpEmail]       = useState('');
  const [otpValue, setOtpValue]       = useState('');
  const [otpSent, setOtpSent]         = useState(false);
  const [sendingOtp, setSendingOtp]   = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const countdown = useCountdown();

  // Reset OTP state when switching role or mode
  useEffect(() => {
    setOtpEmail('');
    setOtpValue('');
    setOtpSent(false);
  }, [role, loginMode]);

  // ── Password Login ────────────────────────────────────
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fn = role === 'admin' ? adminLogin : studentLogin;
      const res = await fn(form);
      const data = res.data;
      const userData = { ...(data.admin || data.student), userType: role };
      login(userData, data.token);
      toast.success(`Welcome back, ${userData.name}!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Send OTP ──────────────────────────────────────────
  const handleSendOTP = async () => {
    if (!otpEmail) return toast.error('Enter your email first');
    setSendingOtp(true);
    try {
      await sendOTP({ email: otpEmail, userType: role });
      setOtpSent(true);
      countdown.start(60);
      toast.success(`OTP sent to ${otpEmail}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  // ── Verify OTP ────────────────────────────────────────
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otpValue || otpValue.length !== 6) return toast.error('Enter a valid 6-digit OTP');
    setVerifyingOtp(true);
    try {
      const res = await verifyOTP({ email: otpEmail, otp: otpValue, userType: role });
      const data = res.data;
      const userData = { ...(data.admin || data.student), userType: role };
      login(userData, data.token);
      toast.success(`Welcome back, ${userData.name}!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">

      {/* 🌞 LIGHT MODE BACKGROUND */}
      <div
        className="absolute inset-0 -z-10 dark:hidden"
        style={{
          backgroundColor: '#6482ad',
          backgroundImage: `url("https://www.transparenttextures.com/patterns/cartographer.png")`,
        }}
      />
      {/* 🌙 DARK MODE BACKGROUND */}
      <div
        className="absolute inset-0 -z-10 hidden dark:block"
        style={{
          backgroundColor: '#9483f2',
          backgroundImage: `url("https://www.transparenttextures.com/patterns/cartographer.png")`,
        }}
      />
      <div className="absolute inset-0 bg-black/10 dark:bg-black/30 -z-10" />

      {/* Glow orbs */}
      <div className="absolute w-[500px] h-[500px] bg-purple-500/30 blur-[120px] rounded-full top-[-100px] left-[-100px] animate-pulse" />
      <div className="absolute w-[400px] h-[400px] bg-blue-400/20 blur-[100px] rounded-full bottom-[-100px] right-[-100px] animate-pulse" />

      <div className="w-full max-w-md animate-slide-up">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl mb-3 shadow-xl animate-pulse">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white drop-shadow">OSMS</h1>
          <p className="text-sm text-white/80">Online Scholarship Management System</p>
        </div>

        {/* Card */}
        <div className="card p-7 animate-fade-in
          bg-[#e2dad6]/95
          dark:bg-dark-secondary/70
          backdrop-blur-2xl
          border border-white/60 dark:border-white/10
          shadow-2xl
          glow">

          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Sign in</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Access your scholarship portal</p>

          {/* Role switch — preserved exactly */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-4">
            {['student', 'admin'].map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-300 capitalize
                  ${role === r
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg scale-[1.03]'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* ── Login mode toggle ──────────────────────── */}
          <div className="flex bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl p-1 mb-5">
            {[
              { key: 'password', icon: KeyRound, label: 'Password' },
              { key: 'otp',      icon: Mail,     label: 'OTP Login' },
            ].map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setLoginMode(key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-lg transition-all duration-200
                  ${loginMode === key
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* ═══════════════════════════════════════════ */}
          {/* PASSWORD LOGIN FORM                         */}
          {/* ═══════════════════════════════════════════ */}
          {loginMode === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4 animate-fade-in">
              <div>
                <label className="label">Email</label>
                <input
                  className="input focus:scale-[1.02]"
                  type="email"
                  placeholder="you@gmail.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    className="input pr-10 focus:scale-[1.02]"
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                {loading
                  ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : 'Sign in'}
              </button>
            </form>
          )}

          {/* ═══════════════════════════════════════════ */}
          {/* OTP LOGIN FORM                              */}
          {/* ═══════════════════════════════════════════ */}
          {loginMode === 'otp' && (
            <div className="space-y-4 animate-fade-in">

              {/* Step 1 — Email + Send OTP */}
              <div>
                <label className="label">Email</label>
                <div className="flex gap-2">
                  <input
                    className="input focus:scale-[1.01]"
                    type="email"
                    placeholder="you@gmail.com"
                    value={otpEmail}
                    onChange={(e) => setOtpEmail(e.target.value)}
                    disabled={otpSent && countdown.active}
                  />
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={sendingOtp || (otpSent && countdown.active)}
                    className="btn-primary flex-shrink-0 px-3 py-2 text-xs whitespace-nowrap"
                  >
                    {sendingOtp ? (
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Send OTP'
                    )}
                  </button>
                </div>
              </div>

              {/* Step 2 — OTP input (shown after send) */}
              {otpSent && (
                <form onSubmit={handleVerifyOTP} className="space-y-4 animate-slide-up">
                  <div>
                    <label className="label">Enter 6-digit OTP</label>
                    <input
                      className="input tracking-[0.4em] text-center font-bold text-lg focus:scale-[1.02]"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="• • • • • •"
                      value={otpValue}
                      onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                      required
                    />
                    {/* Timer / Resend */}
                    <div className="flex items-center justify-between mt-2 px-0.5">
                      <p className="text-xs text-gray-400">
                        OTP sent to <span className="font-medium text-gray-600 dark:text-gray-300">{otpEmail}</span>
                      </p>
                      {countdown.active ? (
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <RefreshCw className="h-3 w-3" />
                          Resend in {countdown.seconds}s
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendOTP}
                          disabled={sendingOtp}
                          className="text-xs text-indigo-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                        >
                          <RefreshCw className="h-3 w-3" />
                          Resend OTP
                        </button>
                      )}
                    </div>
                  </div>

                  <button type="submit" disabled={verifyingOtp} className="btn-primary w-full justify-center py-3">
                    {verifyingOtp
                      ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : 'Verify & Sign in'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Register link */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
            No account?{' '}
            <Link
              to="/register"
              state={{ role }}
              className="text-indigo-600 dark:text-purple-400 font-medium hover:underline"
            >
              {role === 'admin' ? 'Register as Admin' : 'Register here'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
