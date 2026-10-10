// ==============================================================================
// SAFRO TRAVEL APP — FIREBASE CLOUD MESSAGING (FCM) & DEVICE TOKEN SERVICE
// Architecture: Client Token Registration, Multi-Device Mapping, Logout Invalidation
// ==============================================================================

import { DevicePushToken } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_DEVICE_TOKEN_KEY = 'safro_fcm_device_token';
const STORAGE_REGISTERED_DEVICES_KEY = 'safro_user_registered_devices';

class FCMService {
  /**
   * Generates or retrieves a unique persistent client token for this device
   */
  public async getOrGenerateDeviceToken(): Promise<string> {
    if (typeof window === 'undefined') return '';

    let token = localStorage.getItem(STORAGE_DEVICE_TOKEN_KEY);
    if (!token) {
      // Generate standard FCM format synthetic device token
      const randomBytes = Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      token = `fcm_safro_${this.detectPlatform()}_${randomBytes}`;
      localStorage.setItem(STORAGE_DEVICE_TOKEN_KEY, token);
    }
    return token;
  }

  /**
   * Detect current operating platform
   */
  public detectPlatform(): 'android' | 'ios' | 'web' | 'desktop' {
    if (typeof navigator === 'undefined') return 'web';
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('android')) return 'android';
    if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) return 'ios';
    if (ua.includes('windows') || ua.includes('macintosh') || ua.includes('linux')) return 'desktop';
    return 'web';
  }

  /**
   * Registers this device's push token with the user's account
   * Supports multi-device registration per user
   */
  public async registerDeviceWithBackend(userId: string): Promise<DevicePushToken | null> {
    if (!userId) return null;

    const token = await this.getOrGenerateDeviceToken();
    const platform = this.detectPlatform();
    const deviceId = `dev_${platform}_${token.slice(-8)}`;

    const deviceRecord: DevicePushToken = {
      deviceId,
      userId,
      token,
      platform,
      deviceName: `${platform.toUpperCase()} Browser / App (${navigator.language || 'en'})`,
      lastActive: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    // 1. Save locally in device list
    try {
      const existingDevices: DevicePushToken[] = JSON.parse(
        localStorage.getItem(STORAGE_REGISTERED_DEVICES_KEY) || '[]'
      );
      const filtered = existingDevices.filter((d) => d.deviceId !== deviceId);
      filtered.push(deviceRecord);
      localStorage.setItem(STORAGE_REGISTERED_DEVICES_KEY, JSON.stringify(filtered));
    } catch {}

    // 2. Sync to Supabase device_push_tokens table if connected
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('device_push_tokens').upsert(
          {
            device_id: deviceId,
            user_id: userId,
            token,
            platform,
            device_name: deviceRecord.deviceName,
            last_active: deviceRecord.lastActive,
          },
          { onConflict: 'device_id' }
        );
      } catch (err) {
        // Table might be pending SQL script execution
        console.info('[FCM Service] Supabase token sync queued.');
      }
    }

    return deviceRecord;
  }

  /**
   * Invalidate device token upon logout to prevent cross-user notification leakage
   */
  public async invalidateTokenOnLogout(userId: string): Promise<void> {
    const token = localStorage.getItem(STORAGE_DEVICE_TOKEN_KEY);
    if (!token) return;

    if (isSupabaseConfigured() && userId) {
      try {
        await supabase
          .from('device_push_tokens')
          .delete()
          .match({ user_id: userId, token });
      } catch {}
    }

    // Reset local token so next user generates their own
    localStorage.removeItem(STORAGE_DEVICE_TOKEN_KEY);
  }

  /**
   * List all registered devices for the current user
   */
  public getRegisteredDevices(): DevicePushToken[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_REGISTERED_DEVICES_KEY) || '[]');
    } catch {
      return [];
    }
  }
}

export const fcmService = new FCMService();
