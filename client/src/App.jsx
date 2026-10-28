import React, { useState } from 'react';
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

const roleOptions = [
  { id: 'DONOR', label: 'Food Donor', icon: '🍲', desc: 'Restaurant, caterer, or event' },
  { id: 'NGO', label: 'NGO / Charity', icon: '🏢', desc: 'Verified food distributor' },
  { id: 'SHELTER', label: 'Shelter Home', icon: '🏠', desc: 'Community care shelter' },
  { id: 'VOLUNTEER', label: 'Volunteer', icon: '🚴', desc: 'Pickup & delivery driver' }
];

function JoinMovementModal({ isOpen, onClose }) {
  const [mode, setMode] = useState('signin');
  const [selectedRole, setSelectedRole] = useState('DONOR');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  const roleFieldConfig = {
    DONOR: {
      orgLabel: 'Kitchen / organization name',
      orgPlaceholder: 'e.g. Spice Garden Restaurant',
      addressLabel: 'Street address / area',
      cityPlaceholder: 'e.g. Delhi / Noida'
    },
    NGO: {
      orgLabel: 'NGO / charity name',
      orgPlaceholder: 'e.g. Hope Foundation',
      addressLabel: 'Operational address',
      cityPlaceholder: 'e.g. Bengaluru / Hyderabad'
    },
    SHELTER: {
      orgLabel: 'Shelter home name',
      orgPlaceholder: 'e.g. Sunrise Shelter',
      addressLabel: 'Shelter address',
      cityPlaceholder: 'e.g. Pune / Ahmedabad'
    },
    VOLUNTEER: {
      orgLabel: 'Volunteer group / community',
      orgPlaceholder: 'e.g. City Relief Network',
      addressLabel: 'Pickup area / zone',
      cityPlaceholder: 'e.g. Jaipur / Lucknow'
    }
  };

  const currentRoleField = roleFieldConfig[selectedRole] || roleFieldConfig.DONOR;

  const handleSendOtp = () => {
    if (!phone.trim()) return;
    setOtpSent(true);
    setPhoneVerified(false);
  };

  const handleVerifyOtp = () => {
    if (otp.trim().length === 6) {
      setPhoneVerified(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_30px_80px_rgba(15,23,42,0.2)] transition-all duration-300 ease-out animate-[scale_0.18s_ease-out] sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">Welcome</p>
            <h2 className="mt-1 text-2xl font-black tracking-[-0.04em] text-slate-900">
              {mode === 'signin' ? 'Sign in' : 'Create account'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-lg text-slate-500 transition hover:border-slate-300 hover:text-slate-800"
            aria-label="Close join modal"
          >
            ×
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 rounded-2xl border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
              mode === 'signin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode('create')}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
              mode === 'create' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
            }`}
          >
            Create account
          </button>
        </div>

        {mode === 'signin' ? (
          <div className="mt-5 space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Email address</label>
              <input type="email" className="input" placeholder="name@organization.com" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Password</label>
              <input type="password" className="input" placeholder="••••••••" />
            </div>
            <Link to="/login" onClick={onClose} className="block w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-center text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-teal-400">
              Continue to sign in
            </Link>
            <p className="text-center text-sm text-slate-500">
              New here?{' '}
              <button type="button" onClick={() => setMode('create')} className="font-semibold text-emerald-700">Create account</button>
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Select your role</label>
              <div className="grid gap-2 sm:grid-cols-2">
                {roleOptions.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    className={`rounded-2xl border p-3 text-left transition ${
                      selectedRole === role.id
                        ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/10'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{role.icon}</span>
                      <span className="text-sm font-bold text-slate-800">{role.label}</span>
                    </div>
                    <div className="mt-1 text-[10px] text-slate-500">{role.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Full name / representative</label>
              <input type="text" className="input" placeholder="e.g. Rahul Sharma" />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Email address</label>
              <input type="email" className="input" placeholder="name@organization.com" />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Phone number</label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  className="input flex-1"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] font-bold text-emerald-700 transition hover:bg-emerald-100"
                >
                  {otpSent ? 'Resend' : 'Send OTP'}
                </button>
              </div>
            </div>

            {otpSent && (
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">6-digit OTP</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    className="input flex-1"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-[11px] font-bold text-sky-700 transition hover:bg-sky-100 disabled:opacity-50"
                    disabled={otp.length !== 6}
                  >
                    {phoneVerified ? 'Verified' : 'Verify'}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">Demo OTP: 123456</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{currentRoleField.orgLabel}</label>
              <input type="text" className="input" placeholder={currentRoleField.orgPlaceholder} />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{currentRoleField.addressLabel}</label>
              <input type="text" className="input" placeholder="e.g. 124 Sector 18, Commercial Belt" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">City</label>
                <input type="text" className="input" placeholder={currentRoleField.cityPlaceholder} />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">State</label>
                <input type="text" className="input" placeholder="e.g. Delhi / Uttar Pradesh" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Password</label>
              <input type="password" className="input" placeholder="••••••••" />
            </div>

            <Link to="/register" onClick={onClose} className="block w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-center text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-teal-400 disabled:opacity-60" disabled={!phoneVerified}>
              Continue as {roleOptions.find((role) => role.id === selectedRole)?.label}
            </Link>
            <p className="text-center text-sm text-slate-500">
              Already have an account?{' '}
              <button type="button" onClick={() => setMode('signin')} className="font-semibold text-emerald-700">Sign in</button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Home() {
  const { user } = useAuth();
  const [joinModalOpen, setJoinModalOpen] = useState(false);

  const featureCards = [
    {
      icon: '🍲',
      title: 'Donors & kitchens',
      text: 'List surplus meals, groceries, and bakery items in minutes before expiration.',
      to: user ? '/donor/donations/create' : '/register',
      tone: 'emerald'
    },
    {
      icon: '🏢',
      title: 'NGOs & shelters',
      text: 'Discover nearby food in real time and claim support with confidence.',
      to: user ? '/nearby-donations' : '/register',
      tone: 'cyan'
    },
    {
      icon: '🚴',
      title: 'Volunteers',
      text: 'Accept tasks, route pickups, and confirm handoff progress seamlessly.',
      to: user ? '/volunteer/map' : '/register',
      tone: 'amber'
    },
  ];

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
                    <button
                      type="button"
                      onClick={() => setJoinModalOpen(true)}
                      className="brand-button px-8 py-4 text-base"
                    >
                      Join the movement
                    </button>
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

            <div className="mt-16 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {featureCards.map((item) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => {
                    if (!user) {
                      setJoinModalOpen(true);
                    } else {
                      window.location.href = item.to;
                    }
                  }}
                  className="group block rounded-[28px] border border-slate-200/80 bg-white/80 p-6 text-left shadow-[0_15px_40px_rgba(15,23,42,0.06)] backdrop-blur-sm transition duration-200 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_22px_50px_rgba(16,185,129,0.12)] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
                >
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-xl shadow-inner transition duration-200 group-hover:scale-110 ${
                    item.tone === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                    item.tone === 'cyan' ? 'bg-cyan-50 text-cyan-600' :
                    item.tone === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-500'
                  }`}>
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
                    Explore now <span aria-hidden="true">→</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <JoinMovementModal isOpen={joinModalOpen} onClose={() => setJoinModalOpen(false)} />
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
