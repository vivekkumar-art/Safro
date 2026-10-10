import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Key,
  Users,
  Copy,
  Check,
  Plus,
  Lock,
  Bell,
  Sliders,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { AdminRole } from '../../types';

interface AdminTeamMember {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  createdAt: string;
}

const INITIAL_MEMBERS: AdminTeamMember[] = [
  {
    id: 'adm_1',
    name: 'Admin',
    email: 'admin@safro.com',
    role: 'super_admin',
    createdAt: 'Jan 15, 2026',
  },
  {
    id: 'adm_2',
    name: 'Vikram Batra',
    email: 'vikram.admin@safro.internal',
    role: 'admin',
    createdAt: 'Feb 02, 2026',
  },
  {
    id: 'adm_3',
    name: 'Ananya Sharma',
    email: 'ananya.safety@safro.internal',
    role: 'moderator',
    createdAt: 'Mar 10, 2026',
  },
  {
    id: 'adm_4',
    name: 'Suresh Raina',
    email: 'suresh.support@safro.internal',
    role: 'support',
    createdAt: 'Apr 01, 2026',
  },
];

export const AdminSettingsPage: React.FC = () => {
  const { currentAdmin } = useAdminAuth();
  const [members, setMembers] = useState<AdminTeamMember[]>(INITIAL_MEMBERS);
  const [activeTab, setActiveTab] = useState<'roles' | 'invite_codes' | 'security'>('roles');

  // Invite code generation state
  const [inviteCodes, setInviteCodes] = useState<string[]>([
    'SAFRO-ADMIN-2026',
    'SAFRO-SUPER-ADMIN-99',
    'SAFRO-DISPATCH-EMERGENCY',
  ]);
  const [newCodeRole, setNewCodeRole] = useState<AdminRole>('admin');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Security settings state
  const [sessionTimeoutMins, setSessionTimeoutMins] = useState(60);
  const [enforceTwoFactor, setEnforceTwoFactor] = useState(true);
  const [strictInviteOnly, setStrictInviteOnly] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const handleGenerateCode = () => {
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const prefix = newCodeRole === 'super_admin' ? 'SAFRO-SUPER' : 'SAFRO-ADMIN';
    const generated = `${prefix}-${randomHex}-${new Date().getFullYear()}`;
    setInviteCodes((prev) => [generated, ...prev]);
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const getRoleBadge = (role: AdminRole) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 border border-purple-200 dark:border-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800';
      case 'moderator':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          Admin Settings & Access Governance
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure Role-Based Access Control (RBAC), invite codes for secure administrator registration, and security policies.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('roles')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'roles'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Shield className="w-4 h-4" />
          Roles & Permissions
        </button>
        <button
          onClick={() => setActiveTab('invite_codes')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'invite_codes'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Key className="w-4 h-4" />
          Admin Invite Codes
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'security'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Lock className="w-4 h-4" />
          Session & Security
        </button>
      </div>

      {/* Tab: Roles & RBAC */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          {/* Permission matrix overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-sm">
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400">
                Super Admin
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Unrestricted access across all SAFRO modules, invite generation, system controls, and database writes.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-sm">
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
                Admin
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                User management, live location telemetry, push broadcast sender, safety alerts, and analytics.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-sm">
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                Moderator
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Emergency alert acknowledgement/resolution, user activity logs, and SOS response dispatching.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-sm">
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                Support
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Read-only visibility for user profiles, trip histories, and active alert verification.
              </p>
            </div>
          </div>

          {/* Team members table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                Active Administrative Staff ({members.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Granted On</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {members.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        {m.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                        {m.email}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getRoleBadge(m.role)}`}>
                          {m.role.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
                        {m.createdAt}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {m.email !== 'admin@safro.com' ? (
                          <button
                            onClick={() => setMembers((prev) => prev.filter((x) => x.id !== m.id))}
                            className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                            title="Revoke access"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Protected Master</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Admin Invite Codes */}
      {activeTab === 'invite_codes' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Generate Secure Administrator Invitation Code
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Admin registration on <code>/admin/signup</code> requires a valid invite code to prevent unauthorized privilege escalation.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <select
                value={newCodeRole}
                onChange={(e) => setNewCodeRole(e.target.value as AdminRole)}
                className="w-full sm:w-48 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
              >
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
                <option value="support">Support</option>
              </select>

              <button
                onClick={handleGenerateCode}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Generate New Code
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">
              Active Authorized Invite Codes
            </h4>

            <div className="space-y-2">
              {inviteCodes.map((code) => (
                <div
                  key={code}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                >
                  <span className="font-mono text-sm font-semibold text-slate-900 dark:text-white">
                    {code}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(code)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 shadow-sm transition-colors"
                    >
                      {copiedCode === code ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Session & Security */}
      {activeTab === 'security' && (
        <form onSubmit={handleSaveSecurity} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-6 max-w-2xl">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Panel Security & Session Policies
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Enforce enterprise security controls on all administrative portal endpoints.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div>
                <div className="font-semibold text-sm text-slate-900 dark:text-white">
                  Mandatory Invite Code for Registration
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Rejects any signup attempt without a pre-approved invitation token.
                </div>
              </div>
              <input
                type="checkbox"
                checked={strictInviteOnly}
                onChange={(e) => setStrictInviteOnly(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div>
                <div className="font-semibold text-sm text-slate-900 dark:text-white">
                  Enforce Two-Factor Authentication (2FA)
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Requires TOTP authenticator code on unrecognized admin devices.
                </div>
              </div>
              <input
                type="checkbox"
                checked={enforceTwoFactor}
                onChange={(e) => setEnforceTwoFactor(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <label className="block font-semibold text-sm text-slate-900 dark:text-white mb-1">
                Admin Session Idle Inactivity Timeout (Minutes)
              </label>
              <input
                type="number"
                min="15"
                max="480"
                value={sessionTimeoutMins}
                onChange={(e) => setSessionTimeoutMins(Number(e.target.value))}
                className="w-32 px-3 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
              <span className="text-xs text-slate-400 ml-2">Default: 60 minutes</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-colors"
            >
              Save Security Policies
            </button>
            {isSaved && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Policy saved successfully
              </span>
            )}
          </div>
        </form>
      )}
    </div>
  );
};
