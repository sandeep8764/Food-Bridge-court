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
    <div className="min-h-screen bg-transparent text-slate-900 selection:bg-emerald-500 selection:text-slate-900">
      <Navbar />
      <main>
        <section className="relative overflow-hidden pt-16 pb-20 sm:pt-20 lg:pt-24 lg:pb-28">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.14),transparent_30%)]" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-emerald-700 shadow-sm">
                🌱 Zero waste • smarter recovery
              </div>

              <h1 className="text-4xl font-black tracking-[-0.06em] text-slate-900 sm:text-5xl lg:text-7xl">
                Connecting surplus food with{' '}
                <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                  communities in need
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                FoodBridge brings kitchens, NGOs, shelters, and volunteers onto one connected, real-time platform to reduce waste and feed every neighborhood faster.
              </p>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                {user ? (
                  <Link
                    to="/dashboard"
                    className="brand-button px-8 py-4 text-base"
                  >
                    Go to your dashboard →
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="brand-button px-8 py-4 text-base"
                    >
                      Join the movement
                    </Link>
                    <Link
                      to="/leaderboard"
                      className="rounded-2xl border border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-900"
                    >
                      View leaderboard 🏆
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="mt-16 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  icon: '🍲',
                  title: 'Donors & kitchens',
                  text: 'List surplus meals, groceries, and bakery items in minutes before expiration.',
                  tone: 'emerald'
                },
                {
                  icon: '🏢',
                  title: 'NGOs & shelters',
                  text: 'Discover nearby food in real time and claim support with confidence.',
                  tone: 'cyan'
                },
                {
                  icon: '🚴',
                  title: 'Volunteers',
                  text: 'Accept tasks, route pickups, and confirm handoff progress seamlessly.',
                  tone: 'amber'
                },
                {
                  icon: '📊',
                  title: 'Impact analytics',
                  text: 'Track meals saved, carbon offset, and operational outcomes across the network.',
                  tone: 'rose'
                }
              ].map((item) => (
                <div
                  key={item.title}
                  className="group rounded-[28px] border border-slate-200/80 bg-white/80 p-6 shadow-[0_15px_40px_rgba(15,23,42,0.06)] backdrop-blur-sm transition duration-200 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(16,185,129,0.12)]"
                >
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-xl shadow-inner ${
                    item.tone === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                    item.tone === 'cyan' ? 'bg-cyan-50 text-cyan-600' :
                    item.tone === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-500'
                  }`}>
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
                </div>
              ))}
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
