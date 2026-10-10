import React from 'react';
import {
  Home,
  Map as MapIcon,
  GitBranch,
  BarChart3,
  Settings,
  User,
  Power,
  Database,
  Users,
  Truck,
  CloudRain,
  Leaf,
  MessageSquare,
} from 'lucide-react';

export type NavTab = 'home' | 'map' | 'routes' | 'analytics' | 'citizen' | 'multimodal' | 'monsoon' | 'fuel' | 'messaging';

interface NavigationSidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenAuth: () => void;
  onOpenOfflineQueue: () => void;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  activeTab,
  onTabChange,
  onOpenAuth,
  onOpenOfflineQueue
}) => {
  const topNavItems: { id: NavTab; icon: React.ReactNode; label: string; divider?: boolean }[] = [
    { id: 'home', icon: <Home className="w-4 h-4" />, label: 'Command Hub' },
    { id: 'map', icon: <MapIcon className="w-4 h-4" />, label: 'Tactical Map & GIS' },
    { id: 'routes', icon: <GitBranch className="w-4 h-4" />, label: 'AI Dijkstra Corridors & Fleet' },
    { id: 'analytics', icon: <BarChart3 className="w-4 h-4" />, label: 'Regional Analytics & Sync' },
    // ── Feature modules (divider) ──────────────────────────────────
    { id: 'citizen', icon: <Users className="w-4 h-4" />, label: 'Citizen Crowdsourcing Portal', divider: true },
    { id: 'multimodal', icon: <Truck className="w-4 h-4" />, label: 'Multimodal Logistics Planner' },
    { id: 'monsoon', icon: <CloudRain className="w-4 h-4" />, label: 'Predictive Monsoon Risk' },
    { id: 'fuel', icon: <Leaf className="w-4 h-4" />, label: 'Fuel & Carbon Analytics' },
    { id: 'messaging', icon: <MessageSquare className="w-4 h-4" />, label: 'Messaging Gateway' },
  ];

  const featureTabs: NavTab[] = ['citizen', 'multimodal', 'monsoon', 'fuel', 'messaging'];

  return (
    <aside className="absolute left-4 top-24 bottom-24 z-30 flex flex-col justify-between items-center py-4 px-1.5 glass-panel rounded-2xl border border-white/10 shadow-2xl select-none">
      {/* Top Icons */}
      <div className="flex flex-col gap-3">
        {topNavItems.map((item) => {
          const isActive = activeTab === item.id;
          const isFeature = featureTabs.includes(item.id);
          return (
            <React.Fragment key={item.id}>
              {item.divider && (
                <div className="w-6 border-t border-white/10 mx-auto" />
              )}
              <button
                onClick={() => onTabChange(item.id)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  isActive
                    ? isFeature
                      ? 'bg-violet-500/25 text-violet-300 border border-violet-400/40 shadow-[0_0_14px_rgba(139,92,246,0.3)]'
                      : 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/40 shadow-[0_0_14px_rgba(6,182,212,0.3)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
                title={item.label}
              >
                {item.icon}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Bottom Icons: Offline Sync, Profile, Settings, Power */}
      <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
        <button
          onClick={onOpenOfflineQueue}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-colors"
          title="Offline Mutation Sync Ledger"
        >
          <Database className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenAuth}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-colors"
          title="User RBAC Role & Profile"
        >
          <User className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenAuth}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-colors"
          title="System Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        <button
          onClick={() => window.location.reload()}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors"
          title="System Refresh / Standby"
        >
          <Power className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
