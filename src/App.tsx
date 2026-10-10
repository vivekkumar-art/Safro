import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TripProvider } from './context/TripContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';

// Layout
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { SplashScreen } from './pages/SplashScreen';
import { OnboardingPage } from './pages/OnboardingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { PreferencesPage } from './pages/PreferencesPage';
import { HomePage } from './pages/HomePage';
import { TripsPage } from './pages/TripsPage';
import { NewTripWizardPage } from './pages/NewTripWizardPage';
import { BudgetPage } from './pages/BudgetPage';
import { AIPlanningPage } from './pages/AIPlanningPage';
import { TripPreviewPage } from './pages/TripPreviewPage';
import { PaymentPage } from './pages/PaymentPage';
import { LiveTripPage } from './pages/LiveTripPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { OffersPage } from './pages/OffersPage';
import { CreditsPage } from './pages/CreditsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { NielChatPage } from './pages/NielChatPage';
import { NielCommandPage } from './pages/NielCommandPage';

// Admin Context & Components
import { AdminAuthProvider } from './admin/context/AdminAuthContext';
import { AdminThemeProvider } from './admin/context/AdminThemeContext';
import { AdminLayout } from './admin/components/AdminLayout';

// Admin Pages
import { AdminLoginPage } from './admin/pages/AdminLoginPage';
import { AdminDashboardPage } from './admin/pages/AdminDashboardPage';
import { AdminUsersPage } from './admin/pages/AdminUsersPage';
import { AdminLiveLocationsPage } from './admin/pages/AdminLiveLocationsPage';
import { AdminRoutesPage } from './admin/pages/AdminRoutesPage';
import { AdminNotificationsPage } from './admin/pages/AdminNotificationsPage';
import { AdminSafetyAlertsPage } from './admin/pages/AdminSafetyAlertsPage';
import { AdminActivityLogsPage } from './admin/pages/AdminActivityLogsPage';
import { AdminAnalyticsPage } from './admin/pages/AdminAnalyticsPage';
import { AdminSystemStatusPage } from './admin/pages/AdminSystemStatusPage';
import { AdminSettingsPage } from './admin/pages/AdminSettingsPage';
import { AdminDestinationsPage } from './admin/pages/AdminDestinationsPage';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-8 h-8 rounded-full border-4 border-[#1267D6] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Only Route Guard (skips login/signup if session already active)
const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-8 h-8 rounded-full border-4 border-[#1267D6] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AdminAuthProvider>
          <AdminThemeProvider>
            <TripProvider>
              <ToastProvider>
                <NotificationProvider>
                  <Routes>
                    {/* Standalone Flow Routes */}
                    <Route path="/" element={<SplashScreen />} />
                    <Route path="/onboarding" element={<OnboardingPage />} />
                    <Route
                      path="/login"
                      element={
                        <PublicOnlyRoute>
                          <LoginPage />
                        </PublicOnlyRoute>
                      }
                    />
                    <Route
                      path="/signup"
                      element={
                        <PublicOnlyRoute>
                          <SignupPage />
                        </PublicOnlyRoute>
                      }
                    />
                    <Route path="/preferences" element={<PreferencesPage />} />
                    <Route
                      path="/trips/ai-planning"
                      element={
                        <ProtectedRoute>
                          <AIPlanningPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Main Authenticated Application Routes (inside AppLayout) */}
                    <Route
                      element={
                        <ProtectedRoute>
                          <AppLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route path="/home" element={<HomePage />} />
                      <Route path="/trips" element={<TripsPage />} />
                      <Route path="/trips/new" element={<NewTripWizardPage />} />
                      <Route path="/trips/budget" element={<BudgetPage />} />
                      <Route path="/trips/:id" element={<TripPreviewPage />} />
                      <Route path="/trips/:id/payment" element={<PaymentPage />} />
                      <Route path="/trips/:id/live" element={<LiveTripPage />} />
                      <Route path="/live" element={<Navigate to="/trips/trip_manali_01/live" replace />} />
                      <Route path="/live-trip" element={<Navigate to="/trips/trip_manali_01/live" replace />} />
                      <Route path="/trips/:id/expenses" element={<ExpensesPage />} />
                      <Route path="/expenses" element={<ExpensesPage />} />
                      <Route path="/offers" element={<OffersPage />} />
                      <Route path="/credits" element={<CreditsPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/niel-ai" element={<NielChatPage />} />
                    </Route>

                    {/* Standalone Fullscreen NIEL Command Center & Telemetry Radar */}
                    <Route
                      path="/niel"
                      element={
                        <ProtectedRoute>
                          <NielCommandPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/niel-command"
                      element={
                        <ProtectedRoute>
                          <NielCommandPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* ======================================================== */}
                    {/* SAFRO ADMIN SYSTEM (Separate Protected Administrative Area) */}
                    {/* ======================================================== */}
                    <Route path="/admin/login" element={<AdminLoginPage initialTab="login" />} />
                    <Route path="/admin/signup" element={<AdminLoginPage initialTab="signup" />} />
                    <Route path="/admin/forgot-password" element={<AdminLoginPage initialTab="forgot" />} />
                    <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

                    {/* Protected Admin Modules */}
                    <Route element={<AdminLayout />}>
                      <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                      <Route path="/admin/destinations" element={<AdminDestinationsPage />} />
                      <Route path="/admin/niel" element={<NielCommandPage />} />
                      <Route path="/admin/users" element={<AdminUsersPage />} />
                      <Route path="/admin/live-locations" element={<AdminLiveLocationsPage />} />
                      <Route path="/admin/routes" element={<AdminRoutesPage />} />
                      <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
                      <Route path="/admin/safety-alerts" element={<AdminSafetyAlertsPage />} />
                      <Route path="/admin/activity" element={<AdminActivityLogsPage />} />
                      <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
                      <Route path="/admin/system" element={<AdminSystemStatusPage />} />
                      <Route path="/admin/settings" element={<AdminSettingsPage />} />
                    </Route>

                    {/* Fallback to Home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </NotificationProvider>
              </ToastProvider>
            </TripProvider>
          </AdminThemeProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
