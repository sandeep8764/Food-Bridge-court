import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleOptions = [
  { id: 'DONOR', label: 'Food Donor', icon: '🍲', desc: 'Restaurant, caterer, or event' },
  { id: 'NGO', label: 'NGO / Charity', icon: '🏢', desc: 'Verified food distributor' },
  { id: 'SHELTER', label: 'Shelter Home', icon: '🏠', desc: 'Community care shelter' },
  { id: 'VOLUNTEER', label: 'Volunteer', icon: '🚴', desc: 'Pickup & delivery driver' }
];

const roleRedirects = {
  DONOR: '/donor/dashboard',
  NGO: '/ngo/dashboard',
  SHELTER: '/ngo/dashboard',
  VOLUNTEER: '/volunteer/dashboard'
};

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      role: 'DONOR',
      country: 'India'
    }
  });

  const selectedRole = watch('role');

  const onSubmit = async (values) => {
    setServerError('');
    try {
      const user = await registerUser(values);
      navigate(roleRedirects[user.role] || '/dashboard', { replace: true });
    } catch (error) {
      const data = error?.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        setServerError(data.errors.map((e) => e.message).join(' • '));
      } else {
        setServerError(data?.message || error?.message || 'Unable to register account. Please check your network connection.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-start py-8 px-4 sm:px-6 lg:py-12 selection:bg-emerald-500 selection:text-slate-950">
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

      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Create your account</h1>
          <p className="mt-1 text-sm text-slate-400">
            Join thousands of kitchens, charities, and volunteers stopping food waste.
          </p>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          {/* Role Selection Cards */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {roleOptions.map((role) => {
                const isSelected = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setValue('role', role.id)}
                    className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-950'
                    }`}
                  >
                    <span className="text-xl mb-1.5">{role.icon}</span>
                    <span className={`text-xs font-bold ${isSelected ? 'text-emerald-400' : 'text-white'}`}>
                      {role.label}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 leading-tight">{role.desc}</span>
                  </button>
                );
              })}
            </div>
            <input type="hidden" {...register('role', { required: true })} />
          </div>

          {/* Form Fields */}
          <div className="grid gap-3.5 sm:grid-cols-2">
            <Field label="Full Name / Representative" error={errors.name?.message}>
              <input
                className="input"
                placeholder="e.g. Rahul Sharma"
                {...register('name', { required: 'Full name is required' })}
              />
            </Field>

            <Field label="Email Address" error={errors.email?.message}>
              <input
                type="email"
                className="input"
                placeholder="name@organization.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Please enter a valid email address'
                  }
                })}
              />
            </Field>

            <Field label="Password (Min. 8 characters)" error={errors.password?.message}>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' }
                })}
              />
            </Field>

            <Field label="Phone Number" error={errors.phone?.message}>
              <input
                type="tel"
                className="input"
                placeholder="e.g. 9876543210"
                {...register('phone', { required: 'Phone number is required' })}
              />
            </Field>

            <div className="sm:col-span-2">
              <Field label="Organization / Kitchen Name" error={errors.organization_name?.message}>
                <input
                  className="input"
                  placeholder="e.g. Spice Garden Restaurant / Hope Foundation"
                  {...register('organization_name', { required: 'Organization name is required' })}
                />
              </Field>
            </div>

            <div className="sm:col-span-2">
              <Field label="Street Address / Area" error={errors.address?.message}>
                <input
                  className="input"
                  placeholder="e.g. 124 Sector 18, Commercial Belt"
                  {...register('address', { required: 'Address is required' })}
                />
              </Field>
            </div>

            <Field label="City" error={errors.city?.message}>
              <input
                className="input"
                placeholder="e.g. Delhi / Noida"
                {...register('city', { required: 'City is required' })}
              />
            </Field>

            <Field label="State" error={errors.state?.message}>
              <input
                className="input"
                placeholder="e.g. Delhi / Uttar Pradesh"
                {...register('state', { required: 'State is required' })}
              />
            </Field>
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
            {isSubmitting ? 'Creating your account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-5 text-center text-xs sm:text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-emerald-400 hover:underline">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, children, error }) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300">
        {label}
      </label>
      {children}
      {error && <p className="text-xs font-medium text-rose-400">{error}</p>}
    </div>
  );
}
