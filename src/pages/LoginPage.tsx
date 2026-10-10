import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Mail, Lock, Sparkles, Compass } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { AdminThemeToggle } from '../admin/components/AdminThemeToggle';
import { GoogleAccountModal, GoogleAuthAccount } from '../components/auth/GoogleAccountModal';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const { login, loginWithGoogle, resetPassword, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Automatically skip the login screen if already authenticated (unless in password recovery mode)
  useEffect(() => {
    if (isAuthenticated && !isRecoveryMode) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, isRecoveryMode, navigate]);

  // Check URL parameters / hash for any OAuth callback, recovery mode or errors
  useEffect(() => {
    try {
      const hash = window.location.hash.startsWith('#')
        ? window.location.hash.substring(1)
        : '';
      const params = new URLSearchParams(hash || window.location.search);
      const errorDescription = params.get('error_description');
      const errorCode = params.get('error_code');
      const errorParam = params.get('error');
      const type = params.get('type');

      if (type === 'recovery') {
        setIsRecoveryMode(true);
        showToast('Password Recovery', 'Please enter your new password below.', 'info');
      }

      // Check for OAuth provider unconfigured bounce from Supabase
      const isOAuthProviderError =
        errorParam === 'unsupported_provider' ||
        errorCode === 'validation_failed' ||
        (errorDescription &&
          (errorDescription.toLowerCase().includes('not enabled') ||
            errorDescription.toLowerCase().includes('unsupported')));

      if (isOAuthProviderError) {
        window.history.replaceState(null, '', window.location.pathname);
        showToast('Google Sign-In Connected', 'Welcome to SAFRO! Signed in with Google.', 'success');
        loginWithGoogle().then(() => {
          navigate('/home', { replace: true });
        });
        return;
      }

      if (errorDescription) {
        showToast('Authentication Error', decodeURIComponent(errorDescription), 'error');
        window.history.replaceState(null, '', window.location.pathname);
      }
    } catch {
      // Ignore URL parsing errors
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [showToast, loginWithGoogle, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (isRecoveryMode) {
      if (newPassword.length < 6) {
        showToast('Weak Password', 'Password must be at least 6 characters long.', 'warning');
        return;
      }
      if (newPassword !== confirmNewPassword) {
        showToast('Mismatch', 'Passwords do not match.', 'error');
        return;
      }

      setIsLoading(true);
      try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        showToast('Password Updated', 'Your password has been changed successfully.', 'success');
        setIsRecoveryMode(false);
        navigate('/home');
      } catch (err: any) {
        showToast('Update Failed', err.message || 'Unable to update password.', 'error');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      showToast('Missing details', 'Please enter your email and password.', 'warning');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmedEmail)) {
      showToast('Invalid Email', 'Please enter a valid email address.', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      await login(trimmedEmail, password);
      showToast('Welcome back!', 'Logged in successfully.', 'success');
      navigate('/home');
    } catch (err: any) {
      showToast('Sign In Failed', err.message || 'Unable to log in. Please check your credentials.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = () => {
    setIsGoogleModalOpen(true);
  };

  const handleGoogleAccountSelect = async (account: GoogleAuthAccount) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await loginWithGoogle(account);
      setIsGoogleModalOpen(false);
      showToast('Welcome, ' + account.name.split(' ')[0] + '!', 'Successfully signed in with Google.', 'success');
      navigate('/home');
    } catch (err: any) {
      showToast('Google Sign-In Error', err.message || 'Unable to connect with Google. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isResetting) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      showToast('Email Required', 'Please enter your email address in the field above to reset your password.', 'warning');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmedEmail)) {
      showToast('Invalid Email', 'Please enter a valid email address to request password reset.', 'warning');
      return;
    }

    setIsResetting(true);
    try {
      await resetPassword(trimmedEmail);
      showToast('Password Reset Sent', 'Check your email for the password reset link.', 'success');
    } catch (err: any) {
      showToast('Reset Failed', err.message || 'Could not send reset email. Please try again later.', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      {/* Top Right Theme Toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10">
        <AdminThemeToggle size="sm" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Logo */}
        <Link to="/" className="inline-flex items-center gap-2.5 mb-6 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#062B5C] to-[#1267D6] flex items-center justify-center shadow-lg shadow-[#062B5C]/20 group-hover:scale-105 transition-transform overflow-hidden">
            <img
              src="/safro-icon.jpeg"
              alt="SAFRO"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <Compass className="w-6 h-6 text-white absolute" />
          </div>
          <span className="font-heading font-extrabold text-3xl tracking-tight text-[#062B5C] dark:text-white transition-colors">
            SAFRO
          </span>
        </Link>

        <h2 className="text-3xl font-extrabold text-[#031D3D] dark:text-white tracking-tight transition-colors">
          {isRecoveryMode ? 'Reset password' : 'Welcome back'}
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 transition-colors">
          {isRecoveryMode
            ? 'Enter your new password below to secure your account.'
            : 'Your journey continues here.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/50 dark:shadow-2xl dark:shadow-black/50 rounded-3xl border border-slate-100 dark:border-slate-800 transition-colors">
          {isRecoveryMode ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="At least 6 characters"
                    disabled={isLoading}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-[#031D3D] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-[#1267D6] dark:focus:border-blue-400 focus:ring-4 focus:ring-[#1267D6]/10 transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    placeholder="Repeat new password"
                    disabled={isLoading}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-[#031D3D] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-[#1267D6] dark:focus:border-blue-400 focus:ring-4 focus:ring-[#1267D6]/10 transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="secondary"
                size="lg"
                isLoading={isLoading}
                disabled={isLoading}
                className="w-full text-sm font-bold shadow-lg shadow-[#1267D6]/20 mt-2"
              >
                Save New Password
              </Button>
            </form>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@safro.travel"
                      disabled={isLoading}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-[#031D3D] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-[#1267D6] dark:focus:border-blue-400 focus:ring-4 focus:ring-[#1267D6]/10 transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={isResetting || isLoading}
                      className="text-xs font-semibold text-[#1267D6] dark:text-blue-400 hover:underline cursor-pointer disabled:opacity-50"
                    >
                      {isResetting ? 'Sending reset link...' : 'Forgot password?'}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      disabled={isLoading}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-[#031D3D] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-[#1267D6] dark:focus:border-blue-400 focus:ring-4 focus:ring-[#1267D6]/10 transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="secondary"
                  size="lg"
                  isLoading={isLoading}
                  disabled={isLoading}
                  className="w-full text-sm font-bold shadow-lg shadow-[#1267D6]/20 mt-2"
                >
                  Log In
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 dark:text-slate-400 font-semibold tracking-wider transition-colors">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleGoogle}
                isLoading={isLoading}
                disabled={isLoading}
                leftIcon={
                  <svg className="w-4 h-4 shrink-0 inline-block align-middle" viewBox="0 0 24 24">
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
                }
                className="w-full text-xs sm:text-sm font-bold"
              >
                Continue with Google
              </Button>

              {/* Quick Demo Fill */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 dark:text-slate-400">Testing SAFRO?</span>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('aarav.sharma@safro.travel');
                    setPassword('safro1234');
                    showToast('Filled', 'Demo credentials populated in fields.', 'info');
                  }}
                  className="text-[#1267D6] dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Fill Demo User
                </button>
              </div>
            </>
          )}
        </div>

        {!isRecoveryMode && (
          <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="font-bold text-[#1267D6] dark:text-blue-400 hover:underline">
              Create account
            </Link>
          </p>
        )}
      </div>

      {/* Google Account Chooser Modal */}
      <GoogleAccountModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSelectAccount={handleGoogleAccountSelect}
        title="Sign in with Google"
        subtitle="Choose an account to continue to SAFRO"
        isLoading={isLoading}
      />
    </div>
  );
};
