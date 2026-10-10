// ==============================================================================
// SAFRO ADMIN USERS MANAGEMENT PAGE
// Full search, filtering, status toggling, and user details modal with dark mode
// ==============================================================================

import React, { useState } from 'react';
import { Search, UserCheck, Shield, Filter, Ban, CheckCircle, Eye, Mail, Phone, Calendar } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface MockAdminUserItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'User' | 'Admin' | 'Moderator';
  status: 'active' | 'suspended';
  joinedDate: string;
  totalTrips: number;
  avatarUrl: string;
}

const INITIAL_USERS: MockAdminUserItem[] = [
  {
    id: 'SAF12345',
    name: 'Rohit Verma',
    email: 'rohit.verma@gmail.com',
    phone: '+91 98765 11111',
    role: 'User',
    status: 'active',
    joinedDate: 'Jan 2026',
    totalTrips: 14,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'SAF48291',
    name: 'Priya Sharma',
    email: 'priya.s@yahoo.com',
    phone: '+91 98765 22222',
    role: 'User',
    status: 'active',
    joinedDate: 'Feb 2026',
    totalTrips: 8,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'SAF91024',
    name: 'Aarav Singh',
    email: 'aarav.singh@outlook.com',
    phone: '+91 98765 33333',
    role: 'User',
    status: 'active',
    joinedDate: 'Mar 2026',
    totalTrips: 22,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'SAF30192',
    name: 'Neha Joshi',
    email: 'neha.joshi@gmail.com',
    phone: '+91 98765 44444',
    role: 'User',
    status: 'active',
    joinedDate: 'Mar 2026',
    totalTrips: 5,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'SAF88129',
    name: 'Ankit Mehta',
    email: 'ankit.mehta@gmail.com',
    phone: '+91 98765 55555',
    role: 'User',
    status: 'active',
    joinedDate: 'Apr 2026',
    totalTrips: 3,
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'SAF77123',
    name: 'Simran Kaur',
    email: 'simran.k@rediffmail.com',
    phone: '+91 98765 66666',
    role: 'User',
    status: 'suspended',
    joinedDate: 'Dec 2025',
    totalTrips: 19,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'SAF55882',
    name: 'Amit Sharma',
    email: 'amit.sharma99@gmail.com',
    phone: '+91 98765 77777',
    role: 'User',
    status: 'active',
    joinedDate: 'Feb 2026',
    totalTrips: 11,
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
  },
];

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<MockAdminUserItem[]>(INITIAL_USERS);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get('query') || '';

  const [search, setSearch] = useState(initialQuery);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [selectedUser, setSelectedUser] = useState<MockAdminUserItem | null>(null);

  const filteredUsers = users.filter((u) => {
    if (statusFilter !== 'all' && u.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const toggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' }
          : u
      )
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#031D3D] dark:text-white tracking-tight">
            User Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            View, search, and manage user accounts and access permissions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700">
            {filteredUsers.length} Users Listed
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or ID..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-[#031D3D] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1267D6]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
              statusFilter === 'all'
                ? 'bg-[#1267D6] text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
              statusFilter === 'active'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setStatusFilter('suspended')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
              statusFilter === 'suspended'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Suspended
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">ID & Role</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Trips</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatarUrl}
                        alt={u.name}
                        className="w-9 h-9 rounded-xl object-cover ring-2 ring-slate-100 dark:ring-slate-800 shrink-0"
                      />
                      <div>
                        <span className="font-bold text-[#031D3D] dark:text-white block">{u.name}</span>
                        <span className="text-xs text-slate-400 block">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 block">{u.id}</span>
                    <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 block">{u.role}</span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                    {u.phone}
                  </td>
                  <td className="px-6 py-4 font-bold text-[#031D3D] dark:text-white">
                    {u.totalTrips} Trips
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        u.status === 'active'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="p-1.5 text-slate-400 hover:text-[#1267D6] dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                        title="View user details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleUserStatus(u.id)}
                        className={`p-1.5 rounded-lg cursor-pointer ${
                          u.status === 'active'
                            ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50'
                            : 'text-rose-600 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                        }`}
                        title={u.status === 'active' ? 'Suspend User' : 'Reactivate User'}
                      >
                        {u.status === 'active' ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedUser.avatarUrl}
                  alt={selectedUser.name}
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-blue-500/20"
                />
                <div>
                  <h3 className="text-base font-extrabold text-[#031D3D] dark:text-white">{selectedUser.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">ID: {selectedUser.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Email:</span>
                <span className="font-semibold text-[#031D3D] dark:text-slate-100">{selectedUser.email}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Phone:</span>
                <span className="font-semibold text-[#031D3D] dark:text-slate-100">{selectedUser.phone}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Account Role:</span>
                <span className="font-bold text-[#1267D6] dark:text-blue-400">{selectedUser.role}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Joined Date:</span>
                <span className="font-semibold text-[#031D3D] dark:text-slate-100">{selectedUser.joinedDate}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Completed Trips:</span>
                <span className="font-bold text-[#031D3D] dark:text-white">{selectedUser.totalTrips}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  toggleUserStatus(selectedUser.id);
                  setSelectedUser(null);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                  selectedUser.status === 'active'
                    ? 'bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-400'
                    : 'bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-400'
                }`}
              >
                {selectedUser.status === 'active' ? 'Suspend Account' : 'Reactivate Account'}
              </button>
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
