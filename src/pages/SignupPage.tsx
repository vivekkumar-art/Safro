import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { User, Mail, Lock, Compass } from 'lucide-react';
import { AdminThemeToggle } from '../admin/components/AdminThemeToggle';
import { GoogleAccountModal, GoogleAuthAccount } from '../components/auth/GoogleAccountModal';

export const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const { signup, loginWithGoogle, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Redirect to home if user is already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail || !password) {
      showToast('Missing fields', 'Please complete all required fields.', 'warning');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmedEmail)) {
      showToast('Invalid Email', 'Please enter a valid email address.', 'warning');
      return;
    }

    if (password.length < 6) {
      showToast('Weak Password', 'Password must be at least 6 characters long.', 'warning');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Mismatch', 'Passwords do not match.', 'error');
      return;
    }

    if (!agreeTerms) {
      showToast('Terms required', 'Please accept the Terms & Privacy Policy.', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const result = await signup(trimmedName, trimmedEmail, password);

      if (result.requiresEmailConfirmation) {
        showToast(
          'Verification Required',
          'Account created! Please check your email to verify your account before signing in.',
          'info'
        );
        navigate('/login');
      } else {
        showToast('Account Created!', 'Welcome to SAFRO.', 'success');
        navigate('/preferences');
      }
    } catch (err: any) {
      showToast('Registration Failed', err.message || 'Unable to create account. Please try again.', 'error');
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
      showToast('Welcome to SAFRO', 'Successfully registered with Google: ' + account.name, 'success');
      navigate('/preferences');
    } catch (err: any) {
      showToast('Google Sign-Up Error', err.message || 'Unable to connect with Google.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      {/* Top Right Theme Toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10">
        <AdminThemeToggle size="sm" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
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
          Create your account
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 transition-colors">
          Start planning smarter journeys with NIEL AI.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/50 dark:shadow-2xl dark:shadow-black/50 rounded-3xl border border-slate-100 dark:border-slate-800 transition-colors">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Aarav Sharma"
                  disabled={isLoading}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-[#031D3D] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-[#1267D6] dark:focus:border-blue-400 focus:ring-4 focus:ring-[#1267D6]/10 transition-all disabled:opacity-50"
                />
              </div>
            </div>

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
                  placeholder="aarav@safro.travel"
                  disabled={isLoading}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-[#031D3D] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-[#1267D6] dark:focus:border-blue-400 focus:ring-4 focus:ring-[#1267D6]/10 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="At least 6 characters"
                  disabled={isLoading}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-[#031D3D] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-[#1267D6] dark:focus:border-blue-400 focus:ring-4 focus:ring-[#1267D6]/10 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Repeat password"
                  disabled={isLoading}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-[#031D3D] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-[#1267D6] dark:focus:border-blue-400 focus:ring-4 focus:ring-[#1267D6]/10 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                id="terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                disabled={isLoading}
                className="w-4 h-4 text-[#1267D6] rounded-md border-slate-300 dark:border-slate-700 dark:bg-slate-800 focus:ring-[#1267D6] disabled:opacity-50 cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-slate-600 dark:text-slate-300 select-none cursor-pointer">
                I agree to the{' '}
                <a href="#" className="font-semibold text-[#1267D6] dark:text-blue-400 hover:underline">
                  Terms & Conditions
                </a>{' '}
                and Privacy Policy
              </label>
            </div>

            <Button
              type="submit"
              variant="secondary"
              size="lg"
              isLoading={isLoading}
              disabled={isLoading}
              className="w-full text-sm font-bold shadow-lg shadow-[#1267D6]/20 mt-2"
            >
              Create Account
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 dark:text-slate-400 font-semibold tracking-wider transition-colors">
                Or sign up with
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
            Sign up with Google
          </Button>
        </div>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-[#1267D6] dark:text-blue-400 hover:underline">
            Log in
          </Link>
        </p>
      </div>

      {/* Google Account Chooser Modal */}
      <GoogleAccountModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSelectAccount={handleGoogleAccountSelect}
        title="Sign up with Google"
        subtitle="Choose an account to get started with SAFRO"
        isLoading={isLoading}
      />
    </div>
  );
};
