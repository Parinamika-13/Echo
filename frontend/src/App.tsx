import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AdminLayout } from './components/layout/AdminLayout'
import { UserLayout } from './components/layout/UserLayout'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { Skeleton } from './components/feedback/States'

// Public Pages (Lazy Loaded)
const LandingPage = lazy(() => import('./pages/public/LandingPage').then((m) => ({ default: m.LandingPage })))
const PrivacyPage = lazy(() => import('./pages/public/PrivacyPage').then((m) => ({ default: m.PrivacyPage })))
const TermsPage = lazy(() => import('./pages/public/TermsPage').then((m) => ({ default: m.TermsPage })))
const NotFoundPage = lazy(() => import('./pages/public/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))
const AuthPage = lazy(() => import('./pages/public/AuthPage').then((m) => ({ default: m.AuthPage })))

// User Workspace Pages (Lazy Loaded)
const UserDashboardPage = lazy(() => import('./pages/workspace/UserDashboardPage').then((m) => ({ default: m.UserDashboardPage })))
const UserEntitiesPage = lazy(() => import('./pages/workspace/UserEntitiesPage').then((m) => ({ default: m.UserEntitiesPage })))
const UserEntityDetailPage = lazy(() => import('./pages/workspace/UserEntityDetailPage').then((m) => ({ default: m.UserEntityDetailPage })))
const UserSignalsPage = lazy(() => import('./pages/workspace/UserSignalsPage').then((m) => ({ default: m.UserSignalsPage })))
const UserSignalDetailPage = lazy(() => import('./pages/workspace/UserSignalDetailPage').then((m) => ({ default: m.UserSignalDetailPage })))
const UserRiskPage = lazy(() => import('./pages/workspace/UserRiskPage').then((m) => ({ default: m.UserRiskPage })))
const UserRiskDetailPage = lazy(() => import('./pages/workspace/UserRiskDetailPage').then((m) => ({ default: m.UserRiskDetailPage })))
const UserAnalysisPage = lazy(() => import('./pages/workspace/UserAnalysisPage').then((m) => ({ default: m.UserAnalysisPage })))
const UserAnalysisDetailPage = lazy(() => import('./pages/workspace/UserAnalysisDetailPage').then((m) => ({ default: m.UserAnalysisDetailPage })))
const UserInvestigationsPage = lazy(() => import('./pages/workspace/UserInvestigationsPage').then((m) => ({ default: m.UserInvestigationsPage })))
const UserNewInvestigationPage = lazy(() => import('./pages/workspace/UserNewInvestigationPage').then((m) => ({ default: m.UserNewInvestigationPage })))
const UserInvestigationDetailPage = lazy(() => import('./pages/workspace/UserInvestigationDetailPage').then((m) => ({ default: m.UserInvestigationDetailPage })))
const UserWatchlistPage = lazy(() => import('./pages/workspace/UserWatchlistPage').then((m) => ({ default: m.UserWatchlistPage })))
const UserSearchPage = lazy(() => import('./pages/workspace/UserSearchPage').then((m) => ({ default: m.UserSearchPage })))
const UserProfilePage = lazy(() => import('./pages/workspace/UserProfilePage').then((m) => ({ default: m.UserProfilePage })))
const UserSettingsPage = lazy(() => import('./pages/workspace/UserSettingsPage').then((m) => ({ default: m.UserSettingsPage })))

// Admin Pages (Lazy Loaded)
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const EntitiesPage = lazy(() => import('./pages/entities/EntitiesPage').then((m) => ({ default: m.EntitiesPage })))
const EntityDetailPage = lazy(() => import('./pages/entities/EntityDetailPage').then((m) => ({ default: m.EntityDetailPage })))
const InvestigationsPage = lazy(() => import('./pages/investigations/InvestigationsPage').then((m) => ({ default: m.InvestigationsPage })))
const NewInvestigationPage = lazy(() => import('./pages/investigations/NewInvestigationPage').then((m) => ({ default: m.NewInvestigationPage })))
const InvestigationDetailPage = lazy(() => import('./pages/investigations/InvestigationDetailPage').then((m) => ({ default: m.InvestigationDetailPage })))
const SignalsPage = lazy(() => import('./pages/signals/SignalsPage').then((m) => ({ default: m.SignalsPage })))
const SignalDetailPage = lazy(() => import('./pages/signals/SignalDetailPage').then((m) => ({ default: m.SignalDetailPage })))
const RiskPage = lazy(() => import('./pages/risk/RiskPage').then((m) => ({ default: m.RiskPage })))
const RiskDetailPage = lazy(() => import('./pages/risk/RiskDetailPage').then((m) => ({ default: m.RiskDetailPage })))
const AnalysisPage = lazy(() => import('./pages/analysis/AnalysisPage').then((m) => ({ default: m.AnalysisPage })))
const AnalysisDetailPage = lazy(() => import('./pages/analysis/AnalysisDetailPage').then((m) => ({ default: m.AnalysisDetailPage })))
const AgentsPage = lazy(() => import('./pages/agents/AgentsPage').then((m) => ({ default: m.AgentsPage })))
const AgentDetailPage = lazy(() => import('./pages/agents/AgentDetailPage').then((m) => ({ default: m.AgentDetailPage })))
const DatasetsPage = lazy(() => import('./pages/datasets/DatasetsPage').then((m) => ({ default: m.DatasetsPage })))
const DatasetDetailPage = lazy(() => import('./pages/datasets/DatasetDetailPage').then((m) => ({ default: m.DatasetDetailPage })))
const UsersPage = lazy(() => import('./pages/users/UsersPage').then((m) => ({ default: m.UsersPage })))
const UserDetailPage = lazy(() => import('./pages/users/UserDetailPage').then((m) => ({ default: m.UserDetailPage })))
const AuditPage = lazy(() => import('./pages/audit/AuditPage').then((m) => ({ default: m.AuditPage })))
const SystemPage = lazy(() => import('./pages/system/SystemPage').then((m) => ({ default: m.SystemPage })))
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage').then((m) => ({ default: m.ProfilePage })))
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage').then((m) => ({ default: m.SettingsPage })))

function RouteLoader() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 animate-pulse">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-32 w-full" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        {/* Public Website Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/404" element={<NotFoundPage />} />

        {/* Authentication Routes */}
        <Route path="/login" element={<AuthPage />} />
        <Route path="/login/user" element={<Navigate to="/login?context=user" replace />} />
        <Route path="/login/admin" element={<Navigate to="/login?context=admin" replace />} />
        <Route path="/sign-in" element={<Navigate to="/login?mode=signin" replace />} />
        <Route path="/sign-up" element={<Navigate to="/login?mode=signup" replace />} />
        <Route path="/register" element={<Navigate to="/login?mode=signup" replace />} />
        <Route path="/signup" element={<Navigate to="/login?mode=signup" replace />} />
        <Route path="/forgot-password" element={<Navigate to="/login?mode=forgot" replace />} />

        {/* User Workspace Root Redirection */}
        <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />

        {/* Protected User Intelligence Workspace Shell (Top Navbar) */}
        <Route
          path="/app"
          element={
            <ProtectedRoute requireAdmin={false}>
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<UserDashboardPage />} />
          <Route path="entities" element={<UserEntitiesPage />} />
          <Route path="entities/:id" element={<UserEntityDetailPage />} />
          <Route path="signals" element={<UserSignalsPage />} />
          <Route path="signals/:id" element={<UserSignalDetailPage />} />
          <Route path="risk" element={<UserRiskPage />} />
          <Route path="risk/:id" element={<UserRiskDetailPage />} />
          <Route path="analysis" element={<UserAnalysisPage />} />
          <Route path="analysis/:id" element={<UserAnalysisDetailPage />} />
          <Route path="investigations" element={<UserInvestigationsPage />} />
          <Route path="investigations/new" element={<UserNewInvestigationPage />} />
          <Route path="investigations/:id" element={<UserInvestigationDetailPage />} />
          <Route path="watchlist" element={<UserWatchlistPage />} />
          <Route path="search" element={<UserSearchPage />} />
          <Route path="profile" element={<UserProfilePage />} />
          <Route path="settings" element={<UserSettingsPage />} />
        </Route>

        {/* Admin Navigation Root Redirection */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

        {/* Authenticated & Authorized Admin Command Center Shell (Sidebar) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* Overview */}
          <Route path="dashboard" element={<DashboardPage />} />

          {/* Intelligence */}
          <Route path="entities" element={<EntitiesPage />} />
          <Route path="entities/:id" element={<EntityDetailPage />} />

          <Route path="signals" element={<SignalsPage />} />
          <Route path="signals/:id" element={<SignalDetailPage />} />

          <Route path="risk" element={<RiskPage />} />
          <Route path="risk/:id" element={<RiskDetailPage />} />

          <Route path="analysis" element={<AnalysisPage />} />
          <Route path="analysis/:id" element={<AnalysisDetailPage />} />

          {/* Investigations */}
          <Route path="investigations" element={<InvestigationsPage />} />
          <Route path="investigations/new" element={<NewInvestigationPage />} />
          <Route path="investigations/:id" element={<InvestigationDetailPage />} />

          {/* Pipeline */}
          <Route path="agents" element={<AgentsPage />} />
          <Route path="agents/:id" element={<AgentDetailPage />} />

          <Route path="datasets" element={<DatasetsPage />} />
          <Route path="datasets/:id" element={<DatasetDetailPage />} />

          {/* System */}
          <Route path="system" element={<SystemPage />} />
          <Route path="audit" element={<AuditPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="users/:id" element={<UserDetailPage />} />

          {/* Account */}
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Catch-all 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
