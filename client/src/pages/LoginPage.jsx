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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.12),transparent_26%),linear-gradient(180deg,#f8fffb_0%,#f3f7f4_100%)] text-slate-900 selection:bg-emerald-500 selection:text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center px-4 py-4 sm:px-6 lg:px-8">
        <div className="grid w-full gap-4 lg:grid-cols-[1.05fr_1.15fr] lg:items-stretch">
          <aside className="flex min-h-[520px] flex-col justify-between rounded-[32px] border border-emerald-100 bg-white/80 p-5 shadow-[0_25px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-6 lg:p-8">
            <div>
              <Link to="/" className="inline-flex items-center gap-2.5 text-2xl font-black tracking-tight text-slate-900 group">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-transform duration-200 group-hover:scale-105">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span>Food<span className="text-emerald-600">Bridge</span></span>
              </Link>

              <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">
                Welcome back
              </div>

              <h1 className="mt-6 text-4xl font-black tracking-[-0.06em] text-slate-900 sm:text-5xl">
                Sign in to your account
              </h1>
              <p className="mt-4 max-w-md text-base leading-7 text-slate-600">
                Manage donations, claims, routes, and impact updates from one connected food recovery hub.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              {[
                'Monitor donation progress in real time',
                'Approve nearby food claims quickly',
                'Coordinate pickup and delivery tasks smoothly'
              ].map((item, index) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold ${
                    index === 0 ? 'bg-emerald-100 text-emerald-700' : index === 1 ? 'bg-cyan-100 text-cyan-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </aside>

          <div className="flex min-h-[520px] flex-col justify-center rounded-[32px] border border-slate-200 bg-white/85 p-5 shadow-[0_25px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-6 lg:p-8 xl:p-10">
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Welcome back</h2>
              <p className="mt-1 text-sm text-slate-500">Sign in to continue helping communities and reducing food waste.</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Email address
                </label>
                <input
                  type="email"
                  className="input"
                  placeholder="name@organization.com"
                  {...register('email', { required: 'Email address is required' })}
                />
                {errors.email && <p className="text-xs font-medium text-rose-600">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Password
                </label>
                <input
                  type="password"
                  className="input"
                  placeholder="••••••••"
                  {...register('password', { required: 'Password is required' })}
                />
                {errors.password && <p className="text-xs font-medium text-rose-600">{errors.password.message}</p>}
              </div>

              {serverError && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {serverError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-60 disabled:pointer-events-none"
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              New to FoodBridge?{' '}
              <Link to="/register" className="font-semibold text-emerald-700 hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
