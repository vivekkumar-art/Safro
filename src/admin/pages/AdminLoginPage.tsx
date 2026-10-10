// ==============================================================================
// SAFRO ADMIN LOGIN & SIGNUP PAGE
// Pixel-perfect implementation connected to Backend Admin Authentication API
// ==============================================================================

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { AdminThemeToggle } from '../components/AdminThemeToggle';
import {
  Shield,
  MapPin,
  ShieldAlert,
  Bell,
  BarChart3,
  Settings,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  User,
  Phone,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Info,
} from 'lucide-react';

export const AdminLoginPage: React.FC<{ initialTab?: 'login' | 'signup' | 'forgot' }> = ({
  initialTab = 'login',
}) => {
  const { login, signup, forgotPassword, loginWithGoogle } = useAdminAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'forgot'>(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);

  // Form State initialized cleanly without hardcoded passwords in client state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setInfoNotice(null);
    setIsLoading(true);

    try {
      await login(email, password, rememberMe);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid administrative credentials. Access restricted to authorized personnel.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setInfoNotice(null);

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (!inviteCode.trim()) {
      setErrorMsg('Admin Authorization Invite Code is required for administrative authorization.');
      return;
    }

    setIsLoading(true);
    try {
      await signup(name, email, phone, password, inviteCode);
      setSuccessMsg('Admin account verified & created! Redirecting to dashboard...');
      setTimeout(() => navigate('/admin/dashboard'), 800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Check your admin invite code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setInfoNotice(null);

    if (!email.trim()) {
      setErrorMsg('Please enter your administrator email address.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await forgotPassword(email);
      if (!result.configured) {
        setInfoNotice(result.message);
      } else {
        setSuccessMsg(result.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit password reset request.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setInfoNotice(null);
    setIsLoading(true);

    try {
      await loginWithGoogle();
      navigate('/admin/dashboard');
    } catch (err: any) {
      setErrorMsg(
        err.message ||
          'Google authentication has not been configured for the SAFRO Admin Panel. Please sign in using your administrator email and password.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-200">
      {/* =========================================================================
          LEFT COLUMN — SAFRO BRANDING & HIGHER SAFETY THROUGH TECHNOLOGY
          Matching Image 1
          ========================================================================= */}
      <div className="lg:w-1/2 relative bg-[#07172F] text-white flex flex-col justify-between p-8 sm:p-12 lg:p-16 overflow-hidden min-h-[520px] lg:min-h-screen">
        {/* Background Image Overlay with mountain highway & road tracker */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity scale-105 pointer-events-none"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1800&q=80")',
          }}
        />
        {/* Deep navy vignette & gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#07172F]/90 via-[#07172F]/80 to-[#030D1C] pointer-events-none" />

        {/* Top Header Branding */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#1267D6] to-[#1FA2FF] flex items-center justify-center text-white shadow-xl shadow-blue-500/25">
              <Shield className="w-6 h-6 fill-white/20 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-2xl tracking-tight text-white block leading-none">
                SAFRO
              </span>
              <span className="text-xs text-blue-200/80 font-medium block mt-1 tracking-wide">
                Safe Today. Secure Tomorrow.
              </span>
            </div>
          </div>
        </div>

        {/* Center Headline & Features List matching Image 1 */}
        <div className="relative z-10 my-auto py-8 lg:py-12 max-w-lg">
          <span className="text-xs font-extrabold text-[#1FA2FF] uppercase tracking-widest block mb-2">
            ADMIN PANEL
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
            Manage. Monitor.
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#1FA2FF] to-[#38BDF8] mt-1">
              Keep Everyone Safe.
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-4 leading-relaxed font-normal">
            Access the SAFRO administration panel to monitor users, manage notifications, track safety alerts and keep the system running smoothly.
          </p>

          {/* 5 Feature Highlight Bullets matching Image 1 */}
          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-400/20 text-[#38BDF8] flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">Live User Monitoring</h4>
                <p className="text-[11px] text-slate-400">Track real-time locations and activity</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-400/20 text-[#38BDF8] flex items-center justify-center shrink-0 mt-0.5">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">Safety Alerts</h4>
                <p className="text-[11px] text-slate-400">Get instant alerts and respond quickly</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-400/20 text-[#38BDF8] flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">Notification Management</h4>
                <p className="text-[11px] text-slate-400">Send and manage notifications</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-400/20 text-[#38BDF8] flex items-center justify-center shrink-0 mt-0.5">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">Analytics & Reports</h4>
                <p className="text-[11px] text-slate-400">Make data-driven decisions</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-400/20 text-[#38BDF8] flex items-center justify-center shrink-0 mt-0.5">
                <Settings className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">System Control</h4>
                <p className="text-[11px] text-slate-400">Monitor and manage system health</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Handwritten Watermark matching Image 1 */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="italic text-sm sm:text-base font-semibold text-sky-200/90 font-serif tracking-wide">
            Higher Safety <span className="block text-xs font-sans text-sky-300/70 font-normal">Through Technology</span>
          </div>
          <Link to="/home" className="text-xs text-slate-400 hover:text-white transition-colors">
            ← Back to SAFRO User App
          </Link>
        </div>
      </div>

      {/* =========================================================================
          RIGHT COLUMN — ADMIN AUTHENTICATION FORM
          Matching Image 1
          ========================================================================= */}
      <div className="lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 lg:p-16 relative bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-200">
        {/* Top Right Controls (Theme Toggle) matching Image 1 */}
        <div className="flex justify-end">
          <AdminThemeToggle />
        </div>

        {/* Main Form Center */}
        <div className="my-auto max-w-md w-full mx-auto space-y-6">
          {/* Header Title & Shield Logo matching Image 1 */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1267D6] to-[#1FA2FF] flex items-center justify-center text-white mx-auto shadow-xl shadow-blue-600/20">
              <Shield className="w-8 h-8 fill-white/20 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-2xl text-[#031D3D] dark:text-white tracking-tight">
                SAFRO
              </h2>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                Admin Panel
              </span>
            </div>
            <div className="pt-2">
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#031D3D] dark:text-white">
                {activeTab === 'login'
                  ? 'Welcome Back'
                  : activeTab === 'signup'
                  ? 'Create Admin Account'
                  : 'Reset Admin Password'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {activeTab === 'login'
                  ? 'Sign in to your admin account to continue'
                  : activeTab === 'signup'
                  ? 'Requires authorized admin invite code for access'
                  : 'Enter your verified work email address'}
              </p>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5 transition-colors">
            {/* Tabs: Login | Sign Up matching Image 1 */}
            {activeTab !== 'forgot' ? (
              <div className="grid grid-cols-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                    setInfoNotice(null);
                  }}
                  className={`pb-2 text-sm font-bold text-center transition-all relative cursor-pointer ${
                    activeTab === 'login'
                      ? 'text-[#1267D6] dark:text-blue-400'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                >
                  Login
                  {activeTab === 'login' && (
                    <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-[#1267D6] dark:bg-blue-400 rounded-full" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signup');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                    setInfoNotice(null);
                  }}
                  className={`pb-2 text-sm font-bold text-center transition-all relative cursor-pointer ${
                    activeTab === 'signup'
                      ? 'text-[#1267D6] dark:text-blue-400'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                >
                  Sign Up
                  {activeTab === 'signup' && (
                    <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-[#1267D6] dark:bg-blue-400 rounded-full" />
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-sm font-bold text-[#1267D6] dark:text-blue-400">
                  Password Recovery
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                    setInfoNotice(null);
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                </button>
              </div>
            )}

            {/* Error / Success Feedback */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}
            {infoNotice && (
              <div className="p-3.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2.5">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <span className="leading-relaxed">{infoNotice}</span>
              </div>
            )}

            {/* 1. LOGIN FORM */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@safro.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-[#031D3D] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1267D6]/20 focus:border-[#1267D6] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-[#031D3D] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1267D6]/20 focus:border-[#1267D6] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember me & Forgot Password */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-400">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-[#1267D6] rounded border-slate-300 dark:border-slate-700 cursor-pointer"
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('forgot');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                      setInfoNotice(null);
                    }}
                    className="font-bold text-[#1267D6] dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Primary Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-[#1D68FE] hover:bg-[#1557DB] text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Login</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* OR Divider */}
                <div className="relative my-4 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                  </div>
                  <span className="relative px-3 bg-white dark:bg-slate-900 text-[11px] font-bold text-slate-400 uppercase tracking-widest transition-colors">
                    OR
                  </span>
                </div>

                {/* Google Authentication */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-2xs disabled:opacity-60"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Quick Demo Fill for Administrator Testing */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Testing Admin Panel?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('admin@safro.com');
                      setPassword('SafroAdmin@2026Secure!');
                      setInfoNotice('Demo administrator credentials filled.');
                    }}
                    className="text-[#1D68FE] dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Fill Admin Credentials
                  </button>
                </div>
              </form>
            )}

            {/* 2. SIGNUP FORM (with Server-Verified Invite Code) */}
            {activeTab === 'signup' && (
              <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Vikramaditya Rathore"
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-[#031D3D] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1267D6]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Work Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin.name@safro.com"
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-[#031D3D] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1267D6]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-[#031D3D] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1267D6]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Password
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-[#031D3D] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#1267D6]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-[#031D3D] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#1267D6]"
                    />
                  </div>
                </div>

                {/* Admin Invite Code matching requirements */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Admin Authorization Invite Code
                    </label>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">Required</span>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-amber-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      placeholder="e.g. SAFRO-ADMIN-2026"
                      className="w-full pl-10 pr-4 py-2 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs font-mono font-bold text-[#031D3D] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500 uppercase"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Authorized staff code: <code className="text-blue-600 dark:text-blue-400 font-bold">SAFRO-ADMIN-2026</code>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-[#1D68FE] hover:bg-[#1557DB] text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Create Admin Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* 3. FORGOT PASSWORD FORM */}
            {activeTab === 'forgot' && (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Administrator Work Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@safro.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-[#031D3D] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1267D6]/20 focus:border-[#1267D6] transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-[#1D68FE] hover:bg-[#1557DB] text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Send Reset Instructions</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                      setInfoNotice(null);
                    }}
                    className="text-xs text-[#1267D6] dark:text-blue-400 font-bold hover:underline cursor-pointer"
                  >
                    ← Return to Login
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Bottom Security Access Card matching Image 1 */}
          <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex items-center gap-3.5 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-[#1267D6] dark:text-blue-400 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-[#031D3D] dark:text-white">Secure Access</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                Only authorized administrators can access this panel.
              </p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-slate-400 text-xs pt-4">
          © 2026 SAFRO Technologies Inc. All rights reserved.
        </div>
      </div>
    </div>
  );
};
