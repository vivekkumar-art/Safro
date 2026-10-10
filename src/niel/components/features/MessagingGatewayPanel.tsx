import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, RefreshCw, CheckCircle2, XCircle, Clock, Send, Activity, Wifi } from 'lucide-react';

interface ProviderStatus {
  provider: string;
  mode: string;
  channels: string[];
  maxAttempts: number;
  workerMs: number;
}

interface NotificationStats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  deliveryRate: string;
}

interface Notification {
  id: number;
  channel: string;
  recipient: string;
  status: 'PENDING' | 'SENT' | 'FAILED' | 'SKIPPED';
  message_body: string;
  provider: string;
  attempts: number;
  created_at: string;
  sent_at: string | null;
  error_message: string | null;
}

const STATUS_CONFIG = {
  SENT: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30' },
  FAILED: { icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-500/15 border-rose-500/30' },
  PENDING: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30' },
  SKIPPED: { icon: XCircle, color: 'text-slate-400', bg: 'bg-slate-500/15 border-slate-500/30' },
};

const CHANNEL_COLORS: Record<string, string> = {
  sms: 'text-cyan-400',
  whatsapp: 'text-emerald-400',
  push: 'text-violet-400',
};

export const MessagingGatewayPanel: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [status, setStatus] = useState<ProviderStatus | null>(null);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [testMsg, setTestMsg] = useState('');
  const [testChannel, setTestChannel] = useState('sms');
  const [sending, setSending] = useState(false);
  const [testResult, setTestResult] = useState('');

  const token = localStorage.getItem('niel_token');
  const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const statusRes = await fetch('/api/v1/features/messaging-gateway/status');
      if (statusRes.ok) setStatus(await statusRes.json());

      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.role === 'admin') {
            setIsAdmin(true);
            const [statsRes, notifRes] = await Promise.all([
              fetch('/api/v1/features/messaging-gateway/admin/notifications/stats', { headers: authHeaders }),
              fetch('/api/v1/features/messaging-gateway/admin/notifications?limit=30', { headers: authHeaders }),
            ]);
            if (statsRes.ok) setStats(await statsRes.json());
            if (notifRes.ok) {
              const d = await notifRes.json();
              setNotifications(d.notifications || []);
            }
          }
        } catch {}
      }
    } catch (err) {
      console.warn('[MessagingPanel] load error:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const handleTestSend = async () => {
    if (!token || !testPhone || !testMsg) return;
    setSending(true); setTestResult('');
    try {
      const res = await fetch('/api/v1/features/messaging-gateway/admin/notifications/test-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ recipient: testPhone, message: testMsg, channel: testChannel }),
      });
      const d = await res.json();
      if (res.ok) {
        setTestResult(`✅ Dispatched (ID: ${d.id || d.notificationId || 'n/a'}) · Status: ${d.status || 'queued'}`);
        setTimeout(load, 2000);
      } else {
        setTestResult(`❌ ${d.error || 'Send failed'}`);
      }
    } catch {
      setTestResult('❌ Network error');
    }
    setSending(false);
  };

  const deliveryPct = stats ? ((Number(stats.sent) / Math.max(Number(stats.total), 1)) * 100).toFixed(1) : '0';

  return (
    <div className="absolute left-20 top-4 bottom-4 w-[440px] z-30 flex flex-col gap-3 overflow-hidden">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Messaging Gateway</h2>
            <p className="text-xs text-slate-400">SMS · WhatsApp · Driver notifications</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {onClose && (
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all flex items-center justify-center text-xs font-bold">✕</button>
          )}
        </div>
      </div>

      {/* Provider status card */}
      {status && (
        <div className="glass-panel rounded-xl p-4 border border-indigo-500/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wifi className="w-3.5 h-3.5 text-indigo-400" />
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Provider Status</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold">LIVE</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between"><span className="text-slate-400">Provider</span><span className="text-white font-mono">{status.provider}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Mode</span><span className={status.mode === 'dev' ? 'text-amber-400' : 'text-emerald-400'}>{status.mode}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Channels</span><span className="text-white">{status.channels?.join(', ')}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Max retries</span><span className="text-white">{status.maxAttempts}</span></div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {/* Stats */}
        {isAdmin && stats && (
          <>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Total', value: stats.total, color: 'text-slate-300' },
                { label: 'Sent', value: stats.sent, color: 'text-emerald-400' },
                { label: 'Failed', value: stats.failed, color: 'text-rose-400' },
                { label: 'Pending', value: stats.pending, color: 'text-amber-400' },
              ].map(s => (
                <div key={s.label} className="glass-panel rounded-xl p-2.5 border border-white/10 text-center">
                  <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-slate-500">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Delivery rate bar */}
            <div className="glass-panel rounded-xl p-3 border border-white/10">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Activity className="w-3.5 h-3.5" /> Delivery Rate
                </div>
                <span className="text-white font-bold text-sm">{deliveryPct}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(Number(deliveryPct), 100)}%` }}
                />
              </div>
            </div>

            {/* Notification ledger */}
            <div className="glass-panel rounded-xl border border-white/10 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                <h3 className="text-xs font-semibold text-white">Notification Ledger</h3>
              </div>
              <div className="divide-y divide-white/5 max-h-48 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 text-xs">No notifications yet</div>
                ) : (
                  notifications.map(n => {
                    const s = STATUS_CONFIG[n.status] || STATUS_CONFIG.PENDING;
                    const StatusIcon = s.icon;
                    return (
                      <div key={n.id} className="flex items-center gap-3 px-4 py-2.5">
                        <StatusIcon className={`w-3.5 h-3.5 shrink-0 ${s.color}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-semibold ${CHANNEL_COLORS[n.channel] || 'text-slate-400'}`}>
                              {n.channel?.toUpperCase()}
                            </span>
                            <span className="text-slate-500 text-xs">{n.recipient}</span>
                          </div>
                          <p className="text-slate-300 text-xs truncate">{n.message_body}</p>
                        </div>
                        <div className="text-slate-500 text-xs shrink-0">
                          {n.created_at ? new Date(n.created_at).toLocaleTimeString() : ''}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Test send form */}
            <div className="glass-panel rounded-xl p-4 border border-indigo-500/20 space-y-3">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                <Send className="w-3.5 h-3.5 text-indigo-400" /> Test Send
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {['sms', 'whatsapp', 'push'].map(c => (
                  <button
                    key={c}
                    onClick={() => setTestChannel(c)}
                    className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      testChannel === c
                        ? 'bg-indigo-500/25 text-indigo-300 border-indigo-400/40'
                        : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {c.toUpperCase()}
                  </button>
                ))}
              </div>
              <input
                placeholder="Recipient phone / ID"
                value={testPhone}
                onChange={e => setTestPhone(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-indigo-400/40 focus:outline-none transition-all"
              />
              <textarea
                placeholder="Message body…"
                value={testMsg}
                onChange={e => setTestMsg(e.target.value)}
                rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-indigo-400/40 focus:outline-none transition-all resize-none"
              />
              {testResult && (
                <p className={`text-xs ${testResult.startsWith('✅') ? 'text-emerald-400' : 'text-rose-400'}`}>{testResult}</p>
              )}
              <button
                onClick={handleTestSend}
                disabled={sending || !testPhone || !testMsg}
                className="w-full py-2.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/30 text-indigo-300 text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {sending ? 'Sending…' : 'Dispatch Test Message'}
              </button>
            </div>
          </>
        )}

        {!isAdmin && !loading && (
          <div className="glass-panel rounded-xl p-6 text-center border border-white/10">
            <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">Admin access required</p>
            <p className="text-slate-500 text-xs mt-1">Log in as admin to view the notification ledger and send test messages</p>
          </div>
        )}
      </div>
    </div>
  );
};
