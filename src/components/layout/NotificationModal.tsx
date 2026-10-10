import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useNotification } from '../../context/NotificationContext';
import { SafroNotificationHistoryItem } from '../../types';
import {
  Bell,
  Navigation,
  Tag,
  Coins,
  Check,
  ShieldAlert,
  Trash2,
  ExternalLink,
  Smartphone,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  const {
    history,
    unreadCount,
    permission,
    requestPermission,
    markAsRead,
    markAllAsRead,
    clearHistory,
  } = useNotification();

  const [activeTab, setActiveTab] = useState<'all' | 'navigation' | 'safety' | 'offers'>('all');
  const navigate = useNavigate();

  const filteredNotifications = history.filter((n) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'navigation') return n.category === 'navigation';
    if (activeTab === 'safety') return n.category === 'safety';
    if (activeTab === 'offers') return n.category === 'offer' || n.category === 'credit';
    return true;
  });

  const handleClick = (notif: SafroNotificationHistoryItem) => {
    markAsRead(notif.id);
    if (notif.link) {
      onClose();
      navigate(notif.link);
    }
  };

  const getIcon = (category: SafroNotificationHistoryItem['category']) => {
    switch (category) {
      case 'safety':
        return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      case 'navigation':
        return <Navigation className="w-4 h-4 text-[#1267D6]" />;
      case 'credit':
        return <Coins className="w-4 h-4 text-[#19A974]" />;
      case 'offer':
        return <Tag className="w-4 h-4 text-[#F5A623]" />;
      default:
        return <Bell className="w-4 h-4 text-[#062B5C]" />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Notifications"
    >
      {/* 1. Native Permission Status Bar */}
      {permission !== 'granted' && (
        <div className="mb-3.5 p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/80 dark:border-blue-800/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-[#1267D6] text-white shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#062B5C] dark:text-blue-300 truncate">Enable Native Push Alerts</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Receive updates when SAFRO is minimized or locked</p>
            </div>
          </div>
          <button
            onClick={() => requestPermission()}
            className="px-3 py-1.5 rounded-xl bg-[#1267D6] hover:bg-[#0E52AD] text-white text-xs font-bold shadow-xs shrink-0 cursor-pointer transition-colors"
          >
            Enable
          </button>
        </div>
      )}

      {/* 2. Category Filter Tabs */}
      <div className="flex items-center gap-1.5 pb-3 border-b border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-[#062B5C] dark:bg-[#1267D6] text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700'
          }`}
        >
          All ({history.length})
        </button>
        <button
          onClick={() => setActiveTab('navigation')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'navigation'
              ? 'bg-[#1267D6] text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700'
          }`}
        >
          <Navigation className="w-3 h-3" />
          Navigation
        </button>
        <button
          onClick={() => setActiveTab('safety')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'safety'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700'
          }`}
        >
          <ShieldAlert className="w-3 h-3" />
          Safety
        </button>
        <button
          onClick={() => setActiveTab('offers')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'offers'
              ? 'bg-[#19A974] text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700'
          }`}
        >
          <Coins className="w-3 h-3" />
          Rewards & Offers
        </button>
      </div>

      {/* 3. Unread Counter & Actions */}
      <div className="flex justify-between items-center my-3">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {unreadCount > 0 ? `${unreadCount} Unread alerts` : 'All caught up!'}
        </span>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs font-bold text-[#1267D6] dark:text-blue-400 hover:text-[#062B5C] dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              Mark all as read
            </button>
          )}
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-xs font-semibold text-slate-400 hover:text-rose-500 flex items-center gap-1 cursor-pointer transition-colors"
              title="Clear notification history"
            >
              <Trash2 className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* 4. Notification List */}
      <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
        {filteredNotifications.length === 0 ? (
          <div className="py-12 text-center text-slate-400 dark:text-slate-500 space-y-2">
            <Bell className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-xs font-medium">No notifications in this category.</p>
          </div>
        ) : (
          filteredNotifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleClick(n)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 relative group ${
                n.isRead
                  ? 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                  : n.category === 'safety'
                  ? 'bg-rose-50/40 dark:bg-rose-950/30 border-rose-200/80 dark:border-rose-800/60 shadow-sm hover:border-rose-300 text-[#031D3D] dark:text-white'
                  : 'bg-white dark:bg-slate-900 border-[#1267D6]/20 dark:border-slate-700 shadow-sm hover:border-[#1267D6] text-[#031D3D] dark:text-white'
              }`}
            >
              <div
                className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                  n.category === 'safety'
                    ? 'bg-rose-100/70 dark:bg-rose-900/60'
                    : n.isRead
                    ? 'bg-slate-200/60 dark:bg-slate-800'
                    : 'bg-[#EAF4FF] dark:bg-blue-950/60'
                }`}
              >
                {getIcon(n.category)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <h4 className="text-sm font-bold truncate text-[#031D3D] dark:text-white">{n.title}</h4>
                    {n.priority === 'urgent' && (
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-rose-500 text-white shrink-0">
                        Urgent
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {n.message}
                </p>

                {/* Optional Action Hint */}
                {n.link && (
                  <div className="flex items-center gap-1 text-[11px] font-bold text-[#1267D6] mt-2 group-hover:underline">
                    <span>View update</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                )}
              </div>

              {!n.isRead && (
                <span
                  className={`w-2 h-2 rounded-full shrink-0 mt-2 ${
                    n.category === 'safety' ? 'bg-rose-500 animate-ping' : 'bg-[#1267D6]'
                  }`}
                />
              )}
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};
