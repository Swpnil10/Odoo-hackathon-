import React, { useState } from 'react';
import { Leaf, ShieldCheck, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { api, APIError } from '../utils/api';

interface AuthProps {
  onAuthSuccess: (token: string, email: string, role: 'employee' | 'admin') => void;
}

type AuthMode = 'login' | 'signup' | 'reset';

export const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [role, setRole] = useState<'employee' | 'admin'>('employee');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (mode === 'login' || mode === 'signup') {
      if (!password) {
        setError("Please enter your password.");
        return;
      }
    }

    if (mode === 'signup') {
      if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const data = await api.login({ email: trimmedEmail, password });
        // Retrieve access token
        const token = data.access_token;
        // On successful authentication, decode or default role and email
        onAuthSuccess(token, trimmedEmail, role);
      } else if (mode === 'signup') {
        await api.signup({ email: trimmedEmail, password, role });
        setSuccessMsg("Account created successfully! You can now log in.");
        setMode('login');
        setPassword('');
        setConfirmPassword('');
      } else if (mode === 'reset') {
        const data = await api.resetPassword({ email: trimmedEmail });
        setSuccessMsg(data.message || "Password reset instructions sent.");
        setMode('login');
      }
    } catch (err: any) {
      if (err instanceof APIError) {
        setError(err.detail || "Authentication request failed.");
      } else {
        setError(err.message || "An unexpected network error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden font-sans">
      {/* Decorative Blur Backglows */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-emerald-500/5 blur-[120px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-indigo-500/5 blur-[120px] -z-10" />

      <div className="w-full max-w-md">
        {/* Logo / Title Header */}
        <div className="text-center mb-8 select-none">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 shadow-xl shadow-emerald-500/10 mb-4">
            <Leaf className="w-7 h-7 text-[#05070f]" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent">
            EcoSphere
          </h1>
          <p className="text-xs text-brand-textMuted mt-1.5 font-medium tracking-wide uppercase">
            Enterprise ESG Management Platform
          </p>
        </div>

        {/* Auth Card Wrapper */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl relative flex flex-col space-y-4">
          {/* Top Decorative accent border based on current role select */}
          <div className={`absolute top-0 inset-x-0 h-[3px] rounded-t-2xl transition-all duration-300 ${
            role === 'admin' ? 'bg-amber-400' : 'bg-emerald-400'
          }`} />

          {/* Role Segment Selector (Hide on password reset view) */}
          {mode !== 'reset' && (
            <div className="flex bg-slate-900 border border-white/10 rounded-xl p-0.5 mb-6 select-none">
              <button
                type="button"
                onClick={() => setRole('employee')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  role === 'employee'
                    ? 'bg-emerald-500/20 text-emerald-400 shadow border border-emerald-500/10'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Leaf className="w-3.5 h-3.5" />
                Employee Login
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  role === 'admin'
                    ? 'bg-amber-500/20 text-amber-400 shadow border border-amber-500/10'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin Login
              </button>
            </div>
          )}

          {/* Form Title & Subtitle */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">
              {mode === 'login' && (role === 'admin' ? 'Admin Access Portal' : 'Employee Login')}
              {mode === 'signup' && 'Create EcoSphere Account'}
              {mode === 'reset' && 'Reset Password'}
            </h2>
            <p className="text-xs text-brand-textMuted mt-1">
              {mode === 'login' && 'Please authenticate to access your workspace.'}
              {mode === 'signup' && 'Register your details to establish a profile.'}
              {mode === 'reset' && 'Enter your email to receive recovery instructions.'}
            </p>
          </div>

          {/* Status Notifications */}
          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-start gap-2.5 mb-5 leading-normal">
              <span className="shrink-0 font-bold">⚠️</span>
              <p>{error}</p>
            </div>
          )}
          {successMsg && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs flex items-start gap-2.5 mb-5 leading-normal">
              <span className="shrink-0 font-bold">✅</span>
              <p>{successMsg}</p>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  placeholder="name@company.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all font-sans"
                  required
                />
              </div>
            </div>

            {/* Password Input (Hide in reset mode) */}
            {mode !== 'reset' && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all font-sans"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Password (Only in Signup mode) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all font-sans"
                    required
                  />
                </div>
              </div>
            )}

            {/* Forgot password link (Only in Login mode) */}
            {mode === 'login' && (
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => { setMode('reset'); setError(null); }}
                  className="text-[10px] font-bold text-slate-400 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Please Wait...
                </>
              ) : (
                <>
                  {mode === 'login' && 'Sign In'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'reset' && 'Send Verification Email'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Mode Switch Footers */}
          <div className="mt-6 border-t border-white/5 pt-4 text-center text-[11px] font-medium text-slate-400 select-none">
            {mode === 'login' && (
              <p>
                New to the platform?{' '}
                <button
                  onClick={() => { setMode('signup'); setError(null); }}
                  className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors cursor-pointer"
                >
                  Create Account
                </button>
              </p>
            )}
            {mode === 'signup' && (
              <p>
                Already have an account?{' '}
                <button
                  onClick={() => { setMode('login'); setError(null); }}
                  className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors cursor-pointer"
                >
                  Sign In
                </button>
              </p>
            )}
            {mode === 'reset' && (
              <button
                onClick={() => { setMode('login'); setError(null); }}
                className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors cursor-pointer"
              >
                Back to Sign In
              </button>
            )}
          </div>
        </div>

        {/* Demo Switch Warning (Employee Credentials tip) */}
        {mode === 'login' && (
          <div className="mt-5 p-4 bg-slate-900/40 border border-white/5 rounded-xl text-center text-[10px] text-slate-500 font-medium leading-relaxed">
            <span className="text-amber-400 font-bold uppercase tracking-wider block mb-1">Demo Credentials</span>
            <p>Admin: <span className="text-slate-300">admin@ecosphere.com</span> / password: <span className="text-slate-300">adminpassword</span></p>
            <p className="mt-0.5">Employee: <span className="text-slate-300">employee@ecosphere.com</span> / password: <span className="text-slate-300">employeepassword</span></p>
          </div>
        )}
      </div>
    </div>
  );
};
export default Auth;
