// ==============================================================================
// SAFRO TRAVEL APP — CENTRALIZED NOTIFICATION SERVICE
// Zomato-Style Custom Native Push Notification & Live Event Dispatch Engine
// ==============================================================================

import {
  SafroNotificationPayload,
  SafroNotificationPreferences,
  SafroNotificationHistoryItem,
  NotificationCategory,
  NotificationPriority,
  NotificationChannelId,
} from '../types';
import { notificationSoundService } from './notificationSoundService';

const DEFAULT_PREFERENCES: SafroNotificationPreferences = {
  navigationEnabled: true,
  routeUpdatesEnabled: true,
  destinationAlertsEnabled: true,
  safetyAlertsEnabled: true,
  generalUpdatesEnabled: true,
  promotionalEnabled: false,
  soundEnabled: true,
  vibrationEnabled: true,
};

const SAFRO_ICON = '/safro-icon.jpeg';
const STORAGE_PREFS_KEY = 'safro_notification_preferences';
const STORAGE_HISTORY_KEY = 'safro_notification_history';
const STORAGE_DEDUP_KEY = 'safro_notification_dedup_cache';

export interface SafroNotificationResult {
  success: boolean;
  notificationId: string;
  nativeDelivered: boolean;
  suppressedReason?: string;
}

class NotificationService {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private isSwReady: boolean = false;
  private scheduledTimers: Map<string, number> = new Map();
  private recentNotifications: Map<string, number> = new Map();

  constructor() {
    this.initServiceWorker();
    this.initDeepLinkListener();
  }

  /**
   * Initializes and registers the SAFRO Service Worker
   */
  public async initServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return null;
    }

    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      this.swRegistration = reg;
      this.isSwReady = true;

      // Handle service worker updates
      reg.addEventListener('updatefound', () => {
        const installingWorker = reg.installing;
        if (installingWorker) {
          installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'activated') {
              this.swRegistration = reg;
            }
          });
        }
      });

      return reg;
    } catch (err) {
      console.warn('[SAFRO Notification] ServiceWorker registration error:', err);
      return null;
    }
  }

  /**
   * Listen to service worker notification click messages for SPA deep linking
   */
  private initDeepLinkListener(): void {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'SAFRO_NOTIFICATION_CLICK' && event.data.url) {
        this.openNotificationTarget(event.data.url);
      }
    });
  }

  /**
   * Get current browser notification permission
   */
  public getPermissionStatus(): NotificationPermission {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  /**
   * Request native device notification permissions
   */
  public async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // Pre-warm sound context upon permission grant gesture
        notificationSoundService.playSound('general');
      }
      return permission;
    } catch (err) {
      return 'denied';
    }
  }

  /**
   * Read stored preferences
   */
  public getPreferences(): SafroNotificationPreferences {
    try {
      const raw = localStorage.getItem(STORAGE_PREFS_KEY);
      if (raw) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
      }
    } catch {}
    return { ...DEFAULT_PREFERENCES };
  }

  /**
   * Update and save notification preferences
   */
  public savePreferences(prefs: Partial<SafroNotificationPreferences>): SafroNotificationPreferences {
    const updated = { ...this.getPreferences(), ...prefs };
    try {
      localStorage.setItem(STORAGE_PREFS_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('safro:preferences_updated', { detail: updated }));
    } catch {}
    return updated;
  }

  /**
   * Check if notification should be sent based on user preferences
   */
  private shouldSendBasedOnPreferences(
    category: NotificationCategory,
    subType?: string
  ): boolean {
    const prefs = this.getPreferences();

    if (category === 'safety') {
      return prefs.safetyAlertsEnabled;
    }
    if (category === 'navigation') {
      if (!prefs.navigationEnabled) return false;
      if (subType === 'recalculated' || subType === 'deviation') {
        return prefs.routeUpdatesEnabled;
      }
      if (subType === 'approaching' || subType === 'reached') {
        return prefs.destinationAlertsEnabled;
      }
      return true;
    }
    if (category === 'updates' || category === 'general') {
      return prefs.generalUpdatesEnabled;
    }
    if (category === 'offer' || category === 'credit') {
      return prefs.promotionalEnabled !== false;
    }
    return true;
  }

  /**
   * Deduplication check to prevent notification spam
   */
  private isDuplicateOrThrottled(dedupKey: string, cooldownMs: number): boolean {
    const now = Date.now();
    const lastSent = this.recentNotifications.get(dedupKey);

    if (lastSent && now - lastSent < cooldownMs) {
      return true;
    }

    this.recentNotifications.set(dedupKey, now);

    // Keep cache map lean
    if (this.recentNotifications.size > 100) {
      const oldestEntries = Array.from(this.recentNotifications.entries())
        .filter(([, time]) => now - time > 120000);
      oldestEntries.forEach(([key]) => this.recentNotifications.delete(key));
    }

    return false;
  }

  /**
   * Core function to dispatch native notification
   */
  public async sendNotification(
    payload: SafroNotificationPayload
  ): Promise<SafroNotificationResult> {
    const notificationId = payload.notificationId || `safro_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const category: NotificationCategory = payload.category || (payload.type?.toLowerCase().includes('safety') ? 'safety' : payload.type?.toLowerCase().includes('route') || payload.type?.toLowerCase().includes('navigation') ? 'navigation' : 'general') as NotificationCategory;
    const priority: NotificationPriority = payload.priority || (category === 'safety' ? 'urgent' : category === 'navigation' ? 'high' : 'normal');
    const title = payload.title;
    const body = payload.body || payload.message || '';
    const destination = payload.destination || '/home';
    const tag = payload.tag || `safro_${category}_tag`;
    const prefs = this.getPreferences();

    // 1. Preference check
    if (!this.shouldSendBasedOnPreferences(category, payload.type?.toString().toLowerCase())) {
      return {
        success: false,
        notificationId,
        nativeDelivered: false,
        suppressedReason: 'Blocked by user notification preferences',
      };
    }

    // 2. Intelligent Deduplication (Route updates: 15s cooldown; Safety: 5s cooldown; General: 20s)
    const cooldownMs = category === 'safety' ? 5000 : category === 'navigation' ? 15000 : 20000;
    const dedupSignature = `${category}_${title}_${tag}`;

    if (this.isDuplicateOrThrottled(dedupSignature, cooldownMs)) {
      return {
        success: false,
        notificationId,
        nativeDelivered: false,
        suppressedReason: 'Suppressed duplicate notification within cooldown period',
      };
    }

    // 3. Audio & Haptic Feedback
    if (prefs.soundEnabled && payload.sound !== false) {
      notificationSoundService.playSound(category);
    }
    if (prefs.vibrationEnabled && payload.vibrate !== undefined) {
      if (Array.isArray(payload.vibrate) && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate(payload.vibrate); } catch {}
      } else {
        notificationSoundService.triggerVibration(category);
      }
    } else if (prefs.vibrationEnabled) {
      notificationSoundService.triggerVibration(category);
    }

    // 4. Save to in-app notification history
    const historyItem: SafroNotificationHistoryItem = {
      id: notificationId,
      notificationId,
      title,
      message: body,
      category,
      priority,
      time: 'Just now',
      timestamp: Date.now(),
      isRead: false,
      link: destination,
      image: payload.image,
      actions: payload.actions,
      data: payload.data,
    };
    this.addToHistory(historyItem);

    // 5. Native Device Notification Delivery
    let nativeDelivered = false;
    const perm = this.getPermissionStatus();

    if (perm === 'granted' && typeof window !== 'undefined') {
      try {
        const nativeOptions: NotificationOptions & {
          image?: string;
          actions?: any[];
          renotify?: boolean;
          vibrate?: number[];
        } = {
          body,
          icon: payload.icon || SAFRO_ICON,
          badge: payload.badge || SAFRO_ICON,
          image: payload.image || undefined,
          tag,
          renotify: true,
          requireInteraction: category === 'safety' || priority === 'urgent',
          data: {
            url: destination,
            notificationId,
            category,
            priority,
            timestamp: Date.now(),
            ...payload.data,
          },
          actions: payload.actions?.map((a) => ({
            action: a.action,
            title: a.title,
            icon: a.icon,
          })),
        };

        // Try Service Worker registration first (works in background, minimized, lock screen)
        if (this.swRegistration && 'showNotification' in this.swRegistration) {
          await this.swRegistration.showNotification(title, nativeOptions);
          nativeDelivered = true;
        } else if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.ready;
          await reg.showNotification(title, nativeOptions);
          nativeDelivered = true;
        } else if ('Notification' in window) {
          // Fallback to standard window Notification
          const n = new Notification(title, nativeOptions);
          n.onclick = (e) => {
            e.preventDefault();
            window.focus();
            this.openNotificationTarget(destination);
            n.close();
          };
          nativeDelivered = true;
        }
      } catch (err) {
        console.warn('[SAFRO Notification] Native notification dispatch error:', err);
      }
    }

    // 6. Dispatch in-app custom event
    window.dispatchEvent(
      new CustomEvent('safro:notification_received', {
        detail: { historyItem, nativeDelivered },
      })
    );

    return {
      success: true,
      notificationId,
      nativeDelivered,
    };
  }

  // ============================================================================
  // SPECIALIZED NOTIFICATION DISPATCHERS
  // ============================================================================

  /**
   * Navigation notification (Started, Recalculated, Deviation, Approaching, Reached)
   */
  public async sendNavigationNotification(
    subType: 'started' | 'recalculated' | 'deviation' | 'approaching' | 'reached',
    destinationName: string = 'Destination',
    details?: {
      newEta?: string;
      savedMinutes?: number;
      distanceMeters?: number;
      reason?: string;
    },
    data?: Record<string, any>
  ): Promise<SafroNotificationResult> {
    let title = '🚗 Navigation Update';
    let body = `Your route to ${destinationName} is active.`;
    let actions = [{ action: 'view_route', title: '📍 Open Navigation' }];
    const targetUrl = data?.routeUrl || '/trips/trip_manali_01/live';

    switch (subType) {
      case 'started':
        title = '🚗 Navigation Started';
        body = `Your route to ${destinationName} is ready. Live GPS active.`;
        actions = [{ action: 'view_route', title: 'Open Navigation' }];
        break;

      case 'recalculated':
        title = '🔄 Route Updated';
        body = details?.savedMinutes
          ? `We found a better route saving ${details.savedMinutes} mins. ETA: ${details.newEta || 'Updated'}.`
          : `We've found a better route to ${destinationName} based on live traffic.`;
        actions = [{ action: 'view_route', title: 'View Route' }];
        break;

      case 'deviation':
        title = '⚠️ Route Changed';
        body = `You moved away from the planned path. SAFRO is recalculating optimal bypass.`;
        actions = [{ action: 'view_route', title: 'Resume Navigation' }];
        break;

      case 'approaching':
        title = '📍 Almost There';
        body = `You're close to ${destinationName} (~${details?.distanceMeters || 500}m ahead).`;
        actions = [{ action: 'view_route', title: 'View Map' }];
        break;

      case 'reached':
        title = '🎯 You Have Arrived';
        body = `You've reached ${destinationName}. Trip recorded successfully!`;
        actions = [{ action: 'view_route', title: 'View Summary' }];
        break;
    }

    return this.sendNotification({
      type: 'ROUTE_UPDATED',
      category: 'navigation',
      priority: subType === 'deviation' ? 'high' : 'normal',
      title,
      body,
      destination: targetUrl,
      tag: `safro_nav_${subType}`,
      channelId: 'safro-navigation',
      actions,
      data: {
        subType,
        destinationName,
        ...details,
        ...data,
      },
    });
  }

  /**
   * Route Recalculation Notification
   */
  public async sendRouteUpdateNotification(
    details: {
      newEta?: string;
      savedMinutes?: number;
      reason?: string;
      destinationName?: string;
    },
    data?: Record<string, any>
  ): Promise<SafroNotificationResult> {
    return this.sendNavigationNotification(
      'recalculated',
      details.destinationName || 'Destination',
      details,
      data
    );
  }

  /**
   * Destination Approaching or Reached Notification
   */
  public async sendDestinationNotification(
    destinationName: string,
    status: 'approaching' | 'reached',
    data?: Record<string, any>
  ): Promise<SafroNotificationResult> {
    return this.sendNavigationNotification(status, destinationName, undefined, data);
  }

  /**
   * Safety / Emergency Alerts (Highest Priority)
   */
  public async sendSafetyNotification(
    title: string = '🚨 SAFRO Safety Alert',
    message: string = 'An important safety alert requires your attention.',
    severity: 'critical' | 'warning' | 'info' = 'critical',
    data?: Record<string, any>
  ): Promise<SafroNotificationResult> {
    return this.sendNotification({
      type: 'SAFETY_ALERT',
      category: 'safety',
      priority: 'urgent',
      title,
      body: message,
      destination: data?.url || '/trips/trip_manali_01/live',
      tag: `safro_safety_${Date.now()}`,
      channelId: 'safro-safety-alerts',
      requireInteraction: true,
      actions: [
        { action: 'open_safro', title: '🚨 Open SAFRO' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
      data: {
        severity,
        ...data,
      },
    });
  }

  /**
   * Schedule a notification after delayMs milliseconds
   */
  public scheduleNotification(
    payload: SafroNotificationPayload,
    delayMs: number
  ): string {
    const timerId = `timer_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // If Service Worker is ready, delegate to Service Worker so timer persists in background!
    if (this.swRegistration?.active) {
      this.swRegistration.active.postMessage({
        type: 'SCHEDULE_NOTIFICATION',
        payload: {
          title: payload.title,
          options: {
            body: payload.body || payload.message,
            icon: payload.icon || SAFRO_ICON,
            tag: payload.tag || 'safro_scheduled',
            data: { url: payload.destination || '/home' },
          },
        },
        delayMs,
      });
    }

    // Local fallback timer
    const timeout = window.setTimeout(() => {
      this.sendNotification(payload);
      this.scheduledTimers.delete(timerId);
    }, delayMs);

    this.scheduledTimers.set(timerId, timeout);
    return timerId;
  }

  /**
   * Cancel a scheduled notification
   */
  public cancelNotification(timerId: string): boolean {
    const timeout = this.scheduledTimers.get(timerId);
    if (timeout) {
      window.clearTimeout(timeout);
      this.scheduledTimers.delete(timerId);
      return true;
    }
    return false;
  }

  /**
   * Deep linking target resolution
   */
  public openNotificationTarget(targetUrl: string): void {
    if (typeof window === 'undefined') return;

    let cleanPath = targetUrl;

    if (cleanPath.startsWith('safro://')) {
      cleanPath = cleanPath.replace('safro://', '/');
      if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
    }

    // Deep link scheme mappings
    if (cleanPath.startsWith('/navigation')) {
      cleanPath = '/trips/trip_manali_01/live';
    } else if (cleanPath.startsWith('/alerts')) {
      cleanPath = '/niel-ai';
    } else if (cleanPath.startsWith('/destination')) {
      cleanPath = '/trips/trip_manali_01/live';
    }

    // Dispatch SPA router navigation event
    window.dispatchEvent(
      new CustomEvent('safro:navigate_to_route', {
        detail: { path: cleanPath },
      })
    );
  }

  // ============================================================================
  // NOTIFICATION HISTORY MANAGEMENT
  // ============================================================================

  public getNotificationHistory(): SafroNotificationHistoryItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_HISTORY_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {}

    // Initial default mock items if fresh
    const defaults: SafroNotificationHistoryItem[] = [
      {
        id: 'notif_1',
        title: 'Traffic Advisory on NH3',
        message: 'Congestion ahead of Palchan. NIEL AI found a scenic bypass saving 18 mins.',
        time: '10 mins ago',
        timestamp: Date.now() - 600000,
        category: 'navigation',
        priority: 'high',
        isRead: false,
        link: '/trips/trip_manali_01/live',
      },
      {
        id: 'notif_2',
        title: 'Credits Credited: ₹3,200',
        message: 'Savings reward for completing your Rishikesh trip under budget.',
        time: '2 hours ago',
        timestamp: Date.now() - 7200000,
        category: 'credit',
        priority: 'normal',
        isRead: false,
        link: '/credits',
      },
      {
        id: 'notif_3',
        title: 'New Offer: ₹1,000 OFF Hotels',
        message: 'Exclusive resort discounts unlocked for your upcoming Himalayan travel.',
        time: '1 day ago',
        timestamp: Date.now() - 86400000,
        category: 'offer',
        priority: 'normal',
        isRead: true,
        link: '/offers',
      },
    ];

    try {
      localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(defaults));
    } catch {}

    return defaults;
  }

  public addToHistory(item: SafroNotificationHistoryItem): void {
    const list = this.getNotificationHistory();
    // Prepend new notification, cap to 50 items
    const updated = [item, ...list.filter((x) => x.id !== item.id)].slice(0, 50);
    try {
      localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('safro:history_updated', { detail: updated }));
    } catch {}
  }

  public markAsRead(id: string): void {
    const list = this.getNotificationHistory();
    const updated = list.map((item) => (item.id === id ? { ...item, isRead: true } : item));
    try {
      localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('safro:history_updated', { detail: updated }));
    } catch {}
  }

  public markAllAsRead(): void {
    const list = this.getNotificationHistory();
    const updated = list.map((item) => ({ ...item, isRead: true }));
    try {
      localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('safro:history_updated', { detail: updated }));
    } catch {}
  }

  public clearHistory(): void {
    try {
      localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify([]));
      window.dispatchEvent(new CustomEvent('safro:history_updated', { detail: [] }));
    } catch {}
  }

  public getUnreadCount(): number {
    return this.getNotificationHistory().filter((n) => !n.isRead).length;
  }
}

export const notificationService = new NotificationService();
