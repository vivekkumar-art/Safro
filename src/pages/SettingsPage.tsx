import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useToast } from '../context/ToastContext';
import { useNotification } from '../context/NotificationContext';
import { useAdminTheme } from '../admin/context/AdminThemeContext';
import {
  Bell,
  Globe,
  Database,
  CheckCircle2,
  Smartphone,
  Volume2,
  Vibrate,
  Navigation,
  ShieldAlert,
  Send,
  Sparkles,
  Palette,
  Sun,
  Moon,
  Check,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const {
    permission,
    requestPermission,
    preferences,
    updatePreferences,
    sendTestNotification,
  } = useNotification();

  const { theme, setTheme } = useAdminTheme();
  const [currency, setCurrency] = useState('INR (₹)');
  const [units, setUnits] = useState('Metric (km/h)');
  const [testSending, setTestSending] = useState<string | null>(null);

  const handleSave = () => {
    showToast('Settings Saved', 'Your application preferences have been updated.', 'success');
  };

  const handleRunTest = async (type: 'navigation' | 'route_update' | 'safety' | 'destination' | 'general') => {
    setTestSending(type);
    try {
      await sendTestNotification(type);
      showToast('Notification Dispatched', `Triggered native ${type.replace('_', ' ')} alert.`, 'success');
    } catch {
      showToast('Test Failed', 'Unable to trigger test notification.', 'error');
    } finally {
      setTimeout(() => setTestSending(null), 800);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">
      <div>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          APPLICATION PREFERENCES
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#031D3D] tracking-tight">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Manage notifications, display preferences, and backend readiness
        </p>
      </div>

      {/* Backend & Architecture Status */}
      <Card className="p-6 bg-gradient-to-br from-[#062B5C] to-[#031D3D] text-white shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Backend Architecture</h3>
              <p className="text-xs text-blue-200">Supabase Ready • FCM Push Notification Service Active</p>
            </div>
          </div>
          <span className="text-xs font-bold bg-[#19A974] text-white px-3 py-1 rounded-full flex items-center gap-1 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Operational
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          SAFRO is built with clean service layers (`notificationService`, `fcmService`, `mockAuthService`, `mockTripService`, `mockAIService`). You can plug in Supabase URL & Anon Key seamlessly in production.
        </p>
      </Card>

      {/* Notifications Section */}
      <Card className="p-6 bg-white border border-slate-100 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-[#1267D6]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#031D3D]">Live Alerts & Native Notifications</h3>
              <p className="text-xs text-slate-400">Popup alerts for navigation, safety, and destination updates</p>
            </div>
          </div>

          {/* Native OS Permission Status */}
          <div>
            {permission === 'granted' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Device Notifications Active
              </span>
            ) : permission === 'denied' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                Blocked in Browser
              </span>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => requestPermission()}
                leftIcon={<Smartphone className="w-3.5 h-3.5" />}
                className="text-xs font-bold"
              >
                Enable Native Notifications
              </Button>
            )}
          </div>
        </div>

        {/* Granular Preference Toggles */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#031D3D] flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-[#1267D6]" />
                Navigation Notifications
              </h4>
              <p className="text-[11px] text-slate-400">Turn-by-turn guidance and route start alerts</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.navigationEnabled}
              onChange={(e) => updatePreferences({ navigationEnabled: e.target.checked })}
              className="w-4 h-4 text-[#1267D6] rounded border-slate-300 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#031D3D]">Route Updates & Recalculation</h4>
              <p className="text-[11px] text-slate-400">Receive alerts when faster scenic bypass routes are detected</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.routeUpdatesEnabled}
              onChange={(e) => updatePreferences({ routeUpdatesEnabled: e.target.checked })}
              className="w-4 h-4 text-[#1267D6] rounded border-slate-300 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#031D3D]">Destination Approaching & Arrival</h4>
              <p className="text-[11px] text-slate-400">Receive native popups when you are 500m away or have arrived</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.destinationAlertsEnabled}
              onChange={(e) => updatePreferences({ destinationAlertsEnabled: e.target.checked })}
              className="w-4 h-4 text-[#1267D6] rounded border-slate-300 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-rose-700 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                High-Priority Safety Alerts
              </h4>
              <p className="text-[11px] text-slate-400">Urgent weather warnings, roadblock advisories, and SOS notices</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.safetyAlertsEnabled}
              onChange={(e) => updatePreferences({ safetyAlertsEnabled: e.target.checked })}
              className="w-4 h-4 text-[#1267D6] rounded border-slate-300 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#031D3D]">General Updates</h4>
              <p className="text-[11px] text-slate-400">Welcome messages, daily itinerary summaries, and status updates</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.generalUpdatesEnabled}
              onChange={(e) => updatePreferences({ generalUpdatesEnabled: e.target.checked })}
              className="w-4 h-4 text-[#1267D6] rounded border-slate-300 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#031D3D] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#19A974]" />
                Partner Offers & Credits Promos
              </h4>
              <p className="text-[11px] text-slate-400">Hotel discounts, promo codes, and credit earning rewards</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.promotionalEnabled}
              onChange={(e) => updatePreferences({ promotionalEnabled: e.target.checked })}
              className="w-4 h-4 text-[#1267D6] rounded border-slate-300 cursor-pointer"
            />
          </div>

          <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-[#1267D6]" />
                <div>
                  <h5 className="text-xs font-bold text-[#031D3D]">Notification Sound</h5>
                  <p className="text-[10px] text-slate-400">Play custom SAFRO chime</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.soundEnabled}
                onChange={(e) => updatePreferences({ soundEnabled: e.target.checked })}
                className="w-4 h-4 text-[#1267D6] rounded border-slate-300 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2">
                <Vibrate className="w-4 h-4 text-[#19A974]" />
                <div>
                  <h5 className="text-xs font-bold text-[#031D3D]">Device Vibration</h5>
                  <p className="text-[10px] text-slate-400">Haptic feedback on alert</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.vibrationEnabled}
                onChange={(e) => updatePreferences({ vibrationEnabled: e.target.checked })}
                className="w-4 h-4 text-[#1267D6] rounded border-slate-300 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Interactive Zomato-Style Test Panel */}
        <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-[#1267D6]" />
              <h4 className="text-xs font-extrabold text-[#031D3D] uppercase tracking-wider">
                Test Native Push Notifications
              </h4>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              Click to test native device popups
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => handleRunTest('navigation')}
              disabled={!!testSending}
              className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-[#1267D6] hover:bg-blue-50/50 text-[#031D3D] text-xs font-bold transition-all text-left shadow-2xs cursor-pointer"
            >
              <div className="text-[10px] text-[#1267D6] font-extrabold uppercase">Template 1</div>
              <div>🚗 Navigation</div>
            </button>

            <button
              onClick={() => handleRunTest('route_update')}
              disabled={!!testSending}
              className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-[#1267D6] hover:bg-blue-50/50 text-[#031D3D] text-xs font-bold transition-all text-left shadow-2xs cursor-pointer"
            >
              <div className="text-[10px] text-amber-600 font-extrabold uppercase">Template 2</div>
              <div>🔄 Route Updated</div>
            </button>

            <button
              onClick={() => handleRunTest('safety')}
              disabled={!!testSending}
              className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-rose-400 hover:bg-rose-50/50 text-[#031D3D] text-xs font-bold transition-all text-left shadow-2xs cursor-pointer"
            >
              <div className="text-[10px] text-rose-600 font-extrabold uppercase">Template 3</div>
              <div>🚨 Safety Alert</div>
            </button>

            <button
              onClick={() => handleRunTest('destination')}
              disabled={!!testSending}
              className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 text-[#031D3D] text-xs font-bold transition-all text-left shadow-2xs cursor-pointer"
            >
              <div className="text-[10px] text-emerald-600 font-extrabold uppercase">Template 4</div>
              <div>🎯 Arrival & Reward</div>
            </button>
          </div>
        </div>
      </Card>

      {/* Appearance & Display Theme */}
      <Card className="p-6 bg-white border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#1267D6]" />
            <div>
              <h3 className="text-base font-extrabold text-[#031D3D]">Appearance & Theme</h3>
              <p className="text-xs text-slate-400">Customize how SAFRO looks on your device</p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-[#1267D6]">
            {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Light Theme Card */}
          <button
            type="button"
            onClick={() => {
              setTheme('light');
              showToast('Theme Changed', 'Switched to Light mode.', 'info');
            }}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
              theme === 'light'
                ? 'bg-blue-50/50 dark:bg-blue-950/40 border-[#1267D6] ring-2 ring-[#1267D6]/20 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-amber-500 shadow-2xs">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#031D3D] dark:text-white">Light Mode</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Crisp, clean & bright appearance</p>
              </div>
            </div>
            {theme === 'light' && (
              <div className="w-6 h-6 rounded-full bg-[#1267D6] text-white flex items-center justify-center">
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            )}
          </button>

          {/* Dark Theme Card */}
          <button
            type="button"
            onClick={() => {
              setTheme('dark');
              showToast('Theme Changed', 'Switched to Dark mode.', 'info');
            }}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
              theme === 'dark'
                ? 'bg-slate-900 border-[#1267D6] ring-2 ring-[#1267D6]/20 shadow-xs text-white'
                : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-indigo-400 shadow-2xs">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h4 className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-[#031D3D] dark:text-white'}`}>Dark Mode</h4>
                <p className="text-[11px] text-slate-400">Deep slate tones easy on the eyes</p>
              </div>
            </div>
            {theme === 'dark' && (
              <div className="w-6 h-6 rounded-full bg-[#1267D6] text-white flex items-center justify-center">
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            )}
          </button>
        </div>
      </Card>

      {/* Regional & Currency */}
      <Card className="p-6 bg-white border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Globe className="w-5 h-5 text-[#19A974]" />
          <h3 className="text-base font-extrabold text-[#031D3D]">Regional Settings</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Default Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-[#031D3D]"
            >
              <option value="INR (₹)">INR (₹) - Indian Rupee</option>
              <option value="USD ($)">USD ($) - US Dollar</option>
              <option value="EUR (€)">EUR (€) - Euro</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Speed & Distance Units
            </label>
            <select
              value={units}
              onChange={(e) => setUnits(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-[#031D3D]"
            >
              <option value="Metric (km/h)">Metric (Kilometers / km/h)</option>
              <option value="Imperial (mph)">Imperial (Miles / mph)</option>
            </select>
          </div>
        </div>
      </Card>

      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} variant="secondary" size="md" className="font-bold">
          Save Settings
        </Button>
      </div>
    </div>
  );
};
