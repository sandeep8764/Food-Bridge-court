import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const roleNavItems = {
    DONOR: [
      { name: 'Dashboard', path: '/donor/dashboard' },
      { name: 'My Donations', path: '/donor/donations' },
      { name: 'Donate Food', path: '/donor/donations/create' },
      { name: 'Leaderboard', path: '/leaderboard' }
    ],
    NGO: [
      { name: 'Dashboard', path: '/ngo/dashboard' },
      { name: 'Nearby Food', path: '/nearby-donations' },
      { name: 'Leaderboard', path: '/leaderboard' }
    ],
    SHELTER: [
      { name: 'Dashboard', path: '/ngo/dashboard' },
      { name: 'Nearby Food', path: '/nearby-donations' },
      { name: 'Leaderboard', path: '/leaderboard' }
    ],
    VOLUNTEER: [
      { name: 'Dashboard', path: '/volunteer/dashboard' },
      { name: 'Tasks', path: '/volunteer/tasks' },
      { name: 'Map View', path: '/volunteer/map' },
      { name: 'Leaderboard', path: '/leaderboard' }
    ],
    ADMIN: [
      { name: 'Admin Overview', path: '/admin/dashboard' },
      { name: 'Users', path: '/admin/users' },
      { name: 'Donations', path: '/admin/donations' },
      { name: 'Audit Logs', path: '/admin/audit-logs' },
      { name: 'Leaderboard', path: '/leaderboard' }
    ]
  };

  const currentNavItems = user ? roleNavItems[user.role] || [] : [
    { name: 'Leaderboard', path: '/leaderboard' }
  ];

  const roleBadgeColors = {
    ADMIN: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    DONOR: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    NGO: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    SHELTER: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    VOLUNTEER: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 text-xl font-black tracking-tight text-white group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition transform">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span>Food<span className="text-emerald-400">Bridge</span></span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 text-sm font-medium">
            {currentNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`rounded-lg px-3 py-1.5 transition ${
                  isActive(item.path)
                    ? 'bg-emerald-500/15 text-emerald-400 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* User profile / Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                  roleBadgeColors[user.role] || 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                {user.role}
              </span>

              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-sm font-medium text-slate-200 hover:border-slate-700 hover:text-white transition"
              >
                <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xs font-bold uppercase">
                  {user.name?.charAt(0) || 'U'}
                </div>
                <span className="max-w-[120px] truncate">{user.name}</span>
              </Link>

              <button
                onClick={logout}
                className="rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-1.5 text-sm font-medium text-slate-400 hover:bg-rose-500/10 hover:border-rose-500/40 hover:text-rose-300 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to="/login"
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 transition"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            aria-label="Toggle navigation menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-6 space-y-3 animate-fade-in">
          <nav className="flex flex-col gap-1">
            {currentNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                  isActive(item.path)
                    ? 'bg-emerald-500/15 text-emerald-400 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="border-t border-slate-800 pt-3">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="text-sm font-medium text-slate-200">{user.name}</div>
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold uppercase ${roleBadgeColors[user.role]}`}>
                    {user.role}
                  </span>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-xl px-3.5 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  My Profile
                </Link>
                <button
                  onClick={() => { setMobileMenuOpen(false); logout(); }}
                  className="w-full text-left rounded-xl px-3.5 py-2 text-sm text-rose-400 hover:bg-rose-500/10"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 text-center text-sm font-medium text-slate-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full rounded-xl bg-emerald-500 py-2.5 text-center text-sm font-semibold text-slate-950"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
