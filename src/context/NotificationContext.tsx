// ==============================================================================
// SAFRO TRAVEL APP — NOTIFICATION CONTEXT & PROVIDER
// Manages permissions, preferences, live history, audio/vibration & test triggers
// ==============================================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SafroNotificationPayload,
  SafroNotificationPreferences,
  SafroNotificationHistoryItem,
} from '../types';
import { notificationService, SafroNotificationResult } from '../services/notificationService';
import { fcmService } from '../services/fcmService';
import { useAuth } from './AuthContext';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { Bell, Navigation, ShieldAlert, Sparkles } from 'lucide-react';

interface NotificationContextType {
  permission: NotificationPermission;
  isSupported: boolean;
  preferences: SafroNotificationPreferences;
  history: SafroNotificationHistoryItem[];
  unreadCount: number;
  showPermissionPrompt: boolean;
  requestPermission: () => Promise<NotificationPermission>;
  promptPermissionFlow: () => void;
  dismissPermissionPrompt: () => void;
  updatePreferences: (partial: Partial<SafroNotificationPreferences>) => void;
  sendNotification: (payload: SafroNotificationPayload) => Promise<SafroNotificationResult>;
  sendNavigationNotification: (
    subType: 'started' | 'recalculated' | 'deviation' | 'approaching' | 'reached',
    destinationName?: string,
    details?: any
  ) => Promise<SafroNotificationResult>;
  sendSafetyNotification: (title?: string, message?: string, severity?: 'critical' | 'warning' | 'info') => Promise<SafroNotificationResult>;
  sendRouteUpdateNotification: (details: { newEta?: string; savedMinutes?: number; reason?: string; destinationName?: string }) => Promise<SafroNotificationResult>;
  sendDestinationNotification: (destinationName: string, status: 'approaching' | 'reached', data?: Record<string, any>) => Promise<SafroNotificationResult>;
  sendTestNotification: (category: 'navigation' | 'route_update' | 'safety' | 'destination' | 'general') => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearHistory: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [permission, setPermission] = useState<NotificationPermission>(() =>
    notificationService.getPermissionStatus()
  );
  const [preferences, setPreferences] = useState<SafroNotificationPreferences>(() =>
    notificationService.getPreferences()
  );
  const [history, setHistory] = useState<SafroNotificationHistoryItem[]>(() =>
    notificationService.getNotificationHistory()
  );
  const [showPermissionPrompt, setShowPermissionPrompt] = useState<boolean>(false);
  const isSupported = typeof window !== 'undefined' && 'Notification' in window;

  // Sync state on mount and listen to events
  useEffect(() => {
    const handleHistoryUpdate = (e: any) => {
      setHistory(e.detail || notificationService.getNotificationHistory());
    };

    const handlePrefsUpdate = (e: any) => {
      setPreferences(e.detail || notificationService.getPreferences());
    };

    const handleNavigate = (e: any) => {
      if (e.detail?.path) {
        navigate(e.detail.path);
      }
    };

    window.addEventListener('safro:history_updated', handleHistoryUpdate);
    window.addEventListener('safro:preferences_updated', handlePrefsUpdate);
    window.addEventListener('safro:navigate_to_route', handleNavigate);

    // Register FCM device token on session start
    if (user?.id) {
      fcmService.registerDeviceWithBackend(user.id).catch(() => {});
    }

    return () => {
      window.removeEventListener('safro:history_updated', handleHistoryUpdate);
      window.removeEventListener('safro:preferences_updated', handlePrefsUpdate);
      window.removeEventListener('safro:navigate_to_route', handleNavigate);
    };
  }, [user?.id, navigate]);

  // Request native permission directly
  const requestPermission = useCallback(async () => {
    const perm = await notificationService.requestPermission();
    setPermission(perm);
    setShowPermissionPrompt(false);
    return perm;
  }, []);

  const promptPermissionFlow = useCallback(() => {
    if (permission === 'default') {
      setShowPermissionPrompt(true);
    }
  }, [permission]);

  const dismissPermissionPrompt = useCallback(() => {
    setShowPermissionPrompt(false);
    try {
      localStorage.setItem('safro_notif_prompt_dismissed', 'true');
    } catch {}
  }, []);

  const updatePreferences = useCallback((partial: Partial<SafroNotificationPreferences>) => {
    const updated = notificationService.savePreferences(partial);
    setPreferences(updated);
  }, []);

  const sendNotification = useCallback((payload: SafroNotificationPayload) => {
    return notificationService.sendNotification(payload);
  }, []);

  const sendNavigationNotification = useCallback(
    (
      subType: 'started' | 'recalculated' | 'deviation' | 'approaching' | 'reached',
      destinationName: string = 'Solang Valley',
      details?: any
    ) => {
      return notificationService.sendNavigationNotification(subType, destinationName, details);
    },
    []
  );

  const sendSafetyNotification = useCallback(
    (
      title?: string,
      message?: string,
      severity: 'critical' | 'warning' | 'info' = 'critical'
    ) => {
      return notificationService.sendSafetyNotification(title, message, severity);
    },
    []
  );

  const sendRouteUpdateNotification = useCallback(
    (details: { newEta?: string; savedMinutes?: number; reason?: string; destinationName?: string }) => {
      return notificationService.sendRouteUpdateNotification(details);
    },
    []
  );

  const sendDestinationNotification = useCallback(
    (destinationName: string, status: 'approaching' | 'reached', data?: Record<string, any>) => {
      return notificationService.sendDestinationNotification(destinationName, status, data);
    },
    []
  );

  // Zomato-Style Test Notification Generator
  const sendTestNotification = useCallback(
    async (category: 'navigation' | 'route_update' | 'safety' | 'destination' | 'general') => {
      if (permission !== 'granted') {
        const granted = await requestPermission();
        if (granted !== 'granted') {
          // If denied, we still show in-app simulation
        }
      }

      switch (category) {
        case 'navigation':
          await notificationService.sendNavigationNotification(
            'started',
            'Solang Valley Adventure Point',
            { distanceMeters: 8400 }
          );
          break;

        case 'route_update':
          await notificationService.sendRouteUpdateNotification({
            destinationName: 'Solang Valley',
            savedMinutes: 18,
            newEta: '11:48 AM',
            reason: 'Burua Scenic Bypass avoided 26 min traffic delay on NH3',
          });
          break;

        case 'safety':
          await notificationService.sendSafetyNotification(
            '🚨 SAFRO Alert',
            'Heavy rain reported near upper Solang Valley. Rerouting away from active landslide advisory.',
            'critical',
            { url: '/trips/trip_manali_01/live' }
          );
          break;

        case 'destination':
          await notificationService.sendDestinationNotification(
            'Solang Valley Adventure Point',
            'reached',
            { savings: 450, creditsEarned: 220 }
          );
          break;

        case 'general':
        default:
          await notificationService.sendNotification({
            type: 'GENERAL_UPDATE',
            title: 'Welcome back to SAFRO 👋',
            body: 'Your personalized AI itinerary for Manali & Solang Valley is ready.',
            category: 'general',
            destination: '/home',
            actions: [{ action: 'open_safro', title: 'Open SAFRO' }],
          });
          break;
      }
    },
    [permission, requestPermission]
  );

  const markAsRead = useCallback((id: string) => {
    notificationService.markAsRead(id);
  }, []);

  const markAllAsRead = useCallback(() => {
    notificationService.markAllAsRead();
  }, []);

  const clearHistory = useCallback(() => {
    notificationService.clearHistory();
  }, []);

  const unreadCount = history.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        permission,
        isSupported,
        preferences,
        history,
        unreadCount,
        showPermissionPrompt,
        requestPermission,
        promptPermissionFlow,
        dismissPermissionPrompt,
        updatePreferences,
        sendNotification,
        sendNavigationNotification,
        sendSafetyNotification,
        sendRouteUpdateNotification,
        sendDestinationNotification,
        sendTestNotification,
        markAsRead,
        markAllAsRead,
        clearHistory,
      }}
    >
      {children}

      {/* Zomato-Style Friendly Pre-Permission Prompt Modal */}
      <Modal
        isOpen={showPermissionPrompt}
        onClose={dismissPermissionPrompt}
        title="Stay Updated with SAFRO"
        subtitle="Never miss critical route & safety alerts"
      >
        <div className="py-2 space-y-4">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#062B5C] to-[#1267D6] flex items-center justify-center text-white shadow-xl shadow-[#1267D6]/20">
              <Bell className="w-8 h-8 animate-bounce" />
            </div>
          </div>

          <div className="text-center space-y-1">
            <h3 className="text-base font-extrabold text-[#031D3D]">
              Real-time Navigation & Safety Updates
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Receive native device notifications when your route is recalculated, safety advisories are detected, or you approach your destination.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 py-1 text-center">
            <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100">
              <Navigation className="w-4 h-4 text-[#1267D6] mx-auto mb-1" />
              <p className="text-[11px] font-bold text-[#062B5C]">Route Rerouting</p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100">
              <ShieldAlert className="w-4 h-4 text-amber-600 mx-auto mb-1" />
              <p className="text-[11px] font-bold text-amber-900">Safety Alerts</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
              <Sparkles className="w-4 h-4 text-[#19A974] mx-auto mb-1" />
              <p className="text-[11px] font-bold text-emerald-900">Trip Rewards</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              onClick={requestPermission}
              variant="secondary"
              className="w-full font-bold shadow-md shadow-[#1267D6]/20"
            >
              Allow Notifications
            </Button>
            <Button
              onClick={dismissPermissionPrompt}
              variant="outline"
              className="w-full text-xs font-semibold text-slate-500"
            >
              Not Now
            </Button>
          </div>
        </div>
      </Modal>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};
