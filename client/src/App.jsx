import React from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import DonorDonationsPage from './pages/DonorDonationsPage';
import CreateDonationPage from './pages/CreateDonationPage';
import DonationDetailsPage from './pages/DonationDetailsPage';
import DonorDashboardPage from './pages/DonorDashboardPage';
import NgoDashboardPage from './pages/NgoDashboardPage';
import VolunteerDashboardPage from './pages/VolunteerDashboardPage';
import VolunteerTasksPage from './pages/VolunteerTasksPage';
import VolunteerTaskDetailsPage from './pages/VolunteerTaskDetailsPage';
import VolunteerAvailableDonationsMapPage from './pages/VolunteerAvailableDonationsMapPage';
import NearbyDonationsPage from './pages/NearbyDonationsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminDonationsPage from './pages/AdminDonationsPage';
import AdminAuditLogsPage from './pages/AdminAuditLogsPage';

function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-emerald-500 selection:text-slate-950">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-24 lg:pt-32 lg:pb-36">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))]" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-400 mb-8">
              🌱 Empowering Food Recovery & Zero Waste
            </div>

            <h1 className="mx-auto max-w-4xl text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl leading-tight">
              Connecting Surplus Food with{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Communities in Need
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300 leading-relaxed">
              FoodBridge bridges restaurants, caterers, NGOs, shelters, and volunteers into an intelligent, location-aware logistics network saving thousands of meals daily.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-4 text-base font-bold text-slate-950 shadow-xl shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-400 transition transform hover:-translate-y-0.5"
                >
                  Go to Your Dashboard →
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-4 text-base font-bold text-slate-950 shadow-xl shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-400 transition transform hover:-translate-y-0.5"
                  >
                    Join the Movement
                  </Link>
                  <Link
                    to="/leaderboard"
                    className="rounded-2xl border border-slate-800 bg-slate-900/80 px-8 py-4 text-base font-semibold text-slate-200 hover:border-slate-700 hover:text-white transition"
                  >
                    View Community Leaderboard 🏆
                  </Link>
                </>
              )}
            </div>

            {/* Feature Cards Grid */}
            <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 text-left">
              <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 mb-4 text-xl">
                  🍲
                </div>
                <h3 className="text-lg font-bold text-white">Donors & Kitchens</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Quickly list surplus cooked meals, bakery, and groceries before expiration.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 mb-4 text-xl">
                  🏢
                </div>
                <h3 className="text-lg font-bold text-white">NGOs & Shelters</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Discover nearby food with real-time geospatial matching and claim instantly.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 mb-4 text-xl">
                  🚴
                </div>
                <h3 className="text-lg font-bold text-white">Volunteers</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Accept delivery tasks, calculate route directions, and record successful handoffs.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 mb-4 text-xl">
                  📊
                </div>
                <h3 className="text-lg font-bold text-white">Impact Analytics</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Track meals saved, estimated CO2 offset, and complete auditable administrative oversight.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function DashboardRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const redirects = {
    DONOR: '/donor/dashboard',
    NGO: '/ngo/dashboard',
    SHELTER: '/ngo/dashboard',
    VOLUNTEER: '/volunteer/dashboard',
    ADMIN: '/admin/dashboard'
  };

  return <Navigate to={redirects[user.role] || '/profile'} replace />;
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />

          {/* Core Authenticated Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Donor Routes */}
          <Route path="/donor/dashboard" element={<RoleProtectedRoute allowedRoles={['DONOR']}><DonorDashboardPage /></RoleProtectedRoute>} />
          <Route path="/donor/donations" element={<RoleProtectedRoute allowedRoles={['DONOR']}><DonorDonationsPage /></RoleProtectedRoute>} />
          <Route path="/donor/donations/create" element={<RoleProtectedRoute allowedRoles={['DONOR']}><CreateDonationPage /></RoleProtectedRoute>} />
          <Route path="/donor/donations/:id" element={<ProtectedRoute><DonationDetailsPage /></ProtectedRoute>} />

          {/* NGO & Shelter Routes */}
          <Route path="/ngo/dashboard" element={<RoleProtectedRoute allowedRoles={['NGO', 'SHELTER']}><NgoDashboardPage /></RoleProtectedRoute>} />
          <Route path="/nearby-donations" element={<RoleProtectedRoute allowedRoles={['NGO', 'SHELTER', 'VOLUNTEER', 'ADMIN']}><NearbyDonationsPage /></RoleProtectedRoute>} />

          {/* Volunteer Routes */}
          <Route path="/volunteer/dashboard" element={<RoleProtectedRoute allowedRoles={['VOLUNTEER']}><VolunteerDashboardPage /></RoleProtectedRoute>} />
          <Route path="/volunteer/map" element={<RoleProtectedRoute allowedRoles={['VOLUNTEER']}><VolunteerAvailableDonationsMapPage /></RoleProtectedRoute>} />
          <Route path="/volunteer/tasks" element={<RoleProtectedRoute allowedRoles={['VOLUNTEER']}><VolunteerTasksPage /></RoleProtectedRoute>} />
          <Route path="/volunteer/tasks/:id" element={<RoleProtectedRoute allowedRoles={['VOLUNTEER']}><VolunteerTaskDetailsPage /></RoleProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<RoleProtectedRoute allowedRoles={['ADMIN']}><AdminDashboardPage /></RoleProtectedRoute>} />
          <Route path="/admin/users" element={<RoleProtectedRoute allowedRoles={['ADMIN']}><AdminUsersPage /></RoleProtectedRoute>} />
          <Route path="/admin/donations" element={<RoleProtectedRoute allowedRoles={['ADMIN']}><AdminDonationsPage /></RoleProtectedRoute>} />
          <Route path="/admin/audit-logs" element={<RoleProtectedRoute allowedRoles={['ADMIN']}><AdminAuditLogsPage /></RoleProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ToastProvider>
  );
}
