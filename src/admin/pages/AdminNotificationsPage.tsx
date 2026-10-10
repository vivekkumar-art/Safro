// ==============================================================================
// SAFRO ADMIN PUSH NOTIFICATION MANAGEMENT
// Broadcast & Targeted Native Push Engine connected to NotificationService
// Full Light & Dark mode support
// ==============================================================================

import React, { useState } from 'react';
import { adminDataService } from '../services/adminDataService';
import { Send, Bell, ShieldAlert, CheckCircle2, AlertCircle, Clock, Users } from 'lucide-react';

export const AdminNotificationsPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<'general' | 'safety' | 'updates'>('general');
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('normal');
  const [target, setTarget] = useState<'all' | 'active_trips' | 'specific'>('all');
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [sentBroadcasts, setSentBroadcasts] = useState([
    {
      id: 'notif_sent_1',
      title: 'NH3 Traffic Clearance Bypass',
      message: 'Scenic Burua detour cleared. Traffic flow normal.',
      category: 'updates',
      sentAt: '18 mins ago',
      target: 'Active Trips (Solang Valley)',
      delivered: 842,
    },
    {
      id: 'notif_sent_2',
      title: 'Flash Rain Alert — Upper Solang',
      message: 'Sudden rainstorm advisory. Drive at or below 35 km/h.',
      category: 'safety',
      sentAt: '2 hours ago',
      target: 'All Active Mountain Drivers',
      delivered: 1420,
    },
  ]);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setIsSending(true);
    setFeedback(null);

    try {
      await adminDataService.sendAdminNotification({
        title,
        message,
        category,
        priority,
        target,
      });

      setSentBroadcasts((prev) => [
        {
          id: `notif_sent_${Date.now()}`,
          title,
          message,
          category,
          sentAt: 'Just now',
          target: target === 'all' ? 'All Registered Users' : 'Active Travelers',
          delivered: 1842,
        },
        ...prev,
      ]);

      setFeedback({
        type: 'success',
        text: 'Native push notification dispatched successfully to all user devices.',
      });
      setTitle('');
      setMessage('');
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to dispatch push notification.' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#031D3D] dark:text-white tracking-tight">
          Notification Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Dispatch native push notifications, emergency alerts, and system broadcasts
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xs transition-colors">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Sent</span>
          <h4 className="text-2xl font-extrabold text-[#031D3D] dark:text-white mt-0.5">12,684</h4>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">99.4% Delivery Rate</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xs transition-colors">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Delivered</span>
          <h4 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">12,608</h4>
          <span className="text-[11px] text-slate-400">Push Tokens Active</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xs transition-colors">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Open / Read</span>
          <h4 className="text-2xl font-extrabold text-[#1267D6] dark:text-blue-400 mt-0.5">9,842</h4>
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold">78% Engagement</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xs transition-colors">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Failed / Expired</span>
          <h4 className="text-2xl font-extrabold text-slate-400 mt-0.5">76</h4>
          <span className="text-[11px] text-slate-400">Tokens Invalidated</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compose Form */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#1267D6] dark:text-blue-400">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#031D3D] dark:text-white">Compose Push Broadcast</h3>
              <p className="text-xs text-slate-400">Delivered directly to user device notification shade</p>
            </div>
          </div>

          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
              }`}
            >
              {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{feedback.text}</span>
            </div>
          )}

          <form onSubmit={handleSendNotification} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Notification Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 🚨 High Alert: Heavy Snowfall Warning"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-[#031D3D] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1267D6]/20 focus:border-[#1267D6]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Notification Message
              </label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter alert body message displayed on device lock screens..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-[#031D3D] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1267D6]/20 focus:border-[#1267D6]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-[#031D3D] dark:text-white"
                >
                  <option value="general">General</option>
                  <option value="safety">Safety / SOS</option>
                  <option value="updates">Route Update</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-[#031D3D] dark:text-white"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Audience
                </label>
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-[#031D3D] dark:text-white"
                >
                  <option value="all">All Users (8,542)</option>
                  <option value="active_trips">In Transit (892)</option>
                  <option value="specific">Dehradun Region</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-3 px-4 rounded-xl bg-[#1D68FE] hover:bg-[#1557DB] text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isSending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Push Notification Now</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Sent Broadcasts Log */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-extrabold text-[#031D3D] dark:text-white">Recent Broadcasts</h3>
            <span className="text-xs font-semibold text-slate-400">Live Delivery Feed</span>
          </div>

          <div className="space-y-3">
            {sentBroadcasts.map((b) => (
              <div
                key={b.id}
                className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60 space-y-1.5 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-[#031D3D] dark:text-white">{b.title}</h4>
                  <span className="text-[10px] text-slate-400 font-semibold">{b.sentAt}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{b.message}</p>
                <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{b.target}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Delivered: {b.delivered}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
