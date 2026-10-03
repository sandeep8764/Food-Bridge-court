import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleRedirects = {
  DONOR: '/donor/dashboard',
  NGO: '/ngo/dashboard',
  SHELTER: '/ngo/dashboard',
  VOLUNTEER: '/volunteer/dashboard',
  ADMIN: '/admin/dashboard'
};

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm();

  const onSubmit = async (values) => {
    setServerError('');
    try {
      const user = await login(values);
      navigate(roleRedirects[user.role] || '/dashboard', { replace: true });
    } catch (error) {
      const data = error?.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        setServerError(data.errors.map((e) => e.message).join(' • '));
      } else {
        setServerError(data?.message || error?.message || 'Invalid email or password.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-start sm:justify-center py-8 px-4 sm:px-6 selection:bg-emerald-500 selection:text-slate-950">
      {/* Background radial gradient glow */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.12),rgba(255,255,255,0))]" />

      {/* Brand Header */}
      <div className="relative mb-6 text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 text-2xl font-black tracking-tight text-white group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition transform">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span>Food<span className="text-emerald-400">Bridge</span></span>
        </Link>
      </div>

      <div className="relative w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-400">
            Sign in to manage donations, claims, and delivery tasks.
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300">
              Email Address
            </label>
            <input
              type="email"
              className="input"
              placeholder="name@organization.com"
              {...register('email', { required: 'Email address is required' })}
            />
            {errors.email && <p className="text-xs font-medium text-rose-400">{errors.email.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300">
              Password
            </label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && <p className="text-xs font-medium text-rose-400">{errors.password.message}</p>}
          </div>

          {serverError && (
            <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {serverError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-sm sm:text-base font-bold text-slate-950 shadow-xl shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-400 transition transform hover:-translate-y-0.5 disabled:opacity-60 disabled:pointer-events-none"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-5 text-center text-xs sm:text-sm text-slate-400">
          New to FoodBridge?{' '}
          <Link to="/register" className="font-semibold text-emerald-400 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
