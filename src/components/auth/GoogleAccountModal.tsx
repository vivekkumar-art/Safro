import React, { useState, useEffect } from 'react';
import { X, UserPlus, CheckCircle, ArrowRight, ShieldCheck, Mail, User as UserIcon } from 'lucide-react';

export interface GoogleAuthAccount {
  name: string;
  email: string;
  avatarUrl: string;
  badge?: string;
}

interface GoogleAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (account: GoogleAuthAccount) => Promise<void> | void;
  title?: string;
  subtitle?: string;
  isLoading?: boolean;
}

const PRESET_ACCOUNTS: GoogleAuthAccount[] = [
  {
    name: 'Aarav Sharma',
    email: 'aarav.sharma@safro.travel',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    badge: 'SAFRO Verified',
  },
  {
    name: 'Vivek Kumar',
    email: 'vivek82794158@gmail.com',
    avatarUrl:
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    badge: 'Personal Google Account',
  },
];

export const GoogleAccountModal: React.FC<GoogleAccountModalProps> = ({
  isOpen,
  onClose,
  onSelectAccount,
  title = 'Sign in with Google',
  subtitle = 'Choose an account to continue to SAFRO',
  isLoading = false,
}) => {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  // Reset internal state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setIsCustomMode(false);
      setCustomName('');
      setCustomEmail('');
      setSelectedEmail(null);
    }
  }, [isOpen]);

  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const handleChoosePreset = async (account: GoogleAuthAccount) => {
    if (isLoading) return;
    setSelectedEmail(account.email);
    await onSelectAccount(account);
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const trimmedName = customName.trim() || 'Google Explorer';
    const trimmedEmail = customEmail.trim();

    if (!trimmedEmail) return;

    setSelectedEmail(trimmedEmail);
    await onSelectAccount({
      name: trimmedName,
      email: trimmedEmail,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(trimmedName)}&background=1267D6&color=fff&bold=true`,
      badge: 'Custom Google Account',
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all duration-200 scale-100">
        {/* Top Header with Google Brand styling */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Google SVG Icon */}
            <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-sm">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {!isCustomMode ? (
            <div className="space-y-3">
              {PRESET_ACCOUNTS.map((account) => {
                const isThisLoading = isLoading && selectedEmail === account.email;
                return (
                  <button
                    key={account.email}
                    type="button"
                    onClick={() => handleChoosePreset(account)}
                    disabled={isLoading}
                    className="w-full group p-3.5 flex items-center justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-blue-50/60 dark:hover:bg-blue-950/30 hover:border-blue-300 dark:hover:border-blue-700/60 transition-all text-left disabled:opacity-50 cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={account.avatarUrl}
                          alt={account.name}
                          className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-700 group-hover:ring-blue-400 transition-all"
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {account.name}
                          </span>
                          {account.badge && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                              {account.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 font-medium">
                          {account.email}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 ml-3 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all">
                      {isThisLoading ? (
                        <div className="w-5 h-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                      ) : (
                        <ArrowRight className="w-4 h-4" />
                      )}
                    </div>
                  </button>
                );
              })}

              {/* Use Another Account Button */}
              <button
                type="button"
                onClick={() => setIsCustomMode(true)}
                disabled={isLoading}
                className="w-full p-3.5 flex items-center gap-3.5 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all text-left text-slate-700 dark:text-slate-300 group cursor-pointer disabled:opacity-50"
              >
                <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/50 transition-all">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Use another account
                  </span>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Sign in with your own Google email
                  </p>
                </div>
              </button>
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Your Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Aditi Verma"
                    required
                    disabled={isLoading}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Google Email Address
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="e.g. aditi.verma@gmail.com"
                    required
                    disabled={isLoading}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  disabled={isLoading}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  Back to accounts
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !customEmail.trim()}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Privacy & Security Note */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-start gap-2.5 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p>
              To continue, Google will share your verified name, email address, language preference, and profile photo with SAFRO.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
