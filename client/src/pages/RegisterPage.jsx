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
  const { register: registerUser, sendOtp: sendOtpRequest, verifyOtp: verifyOtpRequest } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);

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
  const phoneValue = watch('phone');
  const otpValue = watch('otp');

  const handleSendOtp = async () => {
    const phone = phoneValue?.trim();
    const email = watch('email');

    if (!phone) {
      setServerError('Please enter your phone number before requesting OTP');
      return;
    }

    setServerError('');
    setInfoMessage('');
    setOtpSending(true);

    try {
      const result = await sendOtpRequest({ phone, email });
      setOtpSent(true);
      setPhoneVerified(false);
      setInfoMessage(result?.otp ? `OTP sent successfully. Demo OTP: ${result.otp}` : 'OTP sent successfully. Please enter the code from your SMS.');
    } catch (error) {
      const data = error?.response?.data;
      setServerError(data?.message || error?.message || 'Unable to send OTP. Please try again.');
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    const phone = phoneValue?.trim();
    const otp = otpValue?.trim();

    if (!phone || !otp) {
      setServerError('Please enter the phone number and OTP to verify your account');
      return;
    }

    setServerError('');
    setOtpVerifying(true);

    try {
      await verifyOtpRequest({ phone, otp });
      setPhoneVerified(true);
      setInfoMessage('Phone number verified successfully. You can now create your account.');
    } catch (error) {
      const data = error?.response?.data;
      setPhoneVerified(false);
      setServerError(data?.message || error?.message || 'OTP verification failed. Please try again.');
    } finally {
      setOtpVerifying(false);
    }
  };

  const onSubmit = async (values) => {
    setServerError('');

    if (!phoneVerified) {
      setServerError('Please verify your phone number before creating the account.');
      return;
    }

    try {
      const user = await registerUser({ ...values, otp: values.otp });
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.12),transparent_26%),linear-gradient(180deg,#f8fffb_0%,#f3f7f4_100%)] text-slate-900 selection:bg-emerald-500 selection:text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full gap-6 lg:grid-cols-[1.1fr_1.4fr]">
          <aside className="flex flex-col justify-between rounded-[32px] border border-emerald-100 bg-white/75 p-6 shadow-[0_25px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-8">
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
                Join the network
              </div>

              <h1 className="mt-6 text-4xl font-black tracking-[-0.06em] text-slate-900 sm:text-5xl">
                Create your account
              </h1>
              <p className="mt-4 max-w-md text-base leading-7 text-slate-600">
                Join kitchens, shelters, and volunteers reducing food waste while delivering support to every neighborhood faster.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              {[
                'Fast-track food donation listing',
                'Smart nearby discovery for charities',
                'Volunteer delivery coordination made simple'
              ].map((item, index) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold ${
                    index === 0 ? 'bg-emerald-100 text-emerald-700' :
                    index === 1 ? 'bg-cyan-100 text-cyan-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </aside>

          <div className="rounded-[32px] border border-slate-200 bg-white/85 p-5 shadow-[0_25px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-8 lg:p-10">
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Your details</h2>
              <p className="mt-1 text-sm text-slate-500">Set up your account and start helping communities immediately.</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Select your role
                </label>
                <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-4">
                  {roleOptions.map((role) => {
                    const isSelected = selectedRole === role.id;
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setValue('role', role.id)}
                        className={`flex flex-col items-start rounded-2xl border p-3 text-left transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/10'
                            : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'
                        }`}
                      >
                        <span className="mb-1.5 text-xl">{role.icon}</span>
                        <span className={`text-xs font-bold ${isSelected ? 'text-emerald-700' : 'text-slate-800'}`}>
                          {role.label}
                        </span>
                        <span className="mt-0.5 text-[10px] leading-tight text-slate-500">{role.desc}</span>
                      </button>
                    );
                  })}
                </div>
                <input type="hidden" {...register('role', { required: true })} />
              </div>

              <div className="grid gap-3.5 sm:grid-cols-2">
                <Field label="Full name / representative" error={errors.name?.message}>
                  <input
                    className="input"
                    placeholder="e.g. Rahul Sharma"
                    {...register('name', { required: 'Full name is required' })}
                  />
                </Field>

                <Field label="Email address" error={errors.email?.message}>
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

                <Field label="Password" error={errors.password?.message}>
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

                <Field label="Phone number" error={errors.phone?.message}>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      className="input flex-1"
                      placeholder="e.g. 9876543210"
                      {...register('phone', { required: 'Phone number is required' })}
                    />
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={otpSending}
                      className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                    >
                      {otpSending ? 'Sending...' : otpSent ? 'Resend OTP' : 'Send OTP'}
                    </button>
                  </div>
                </Field>

                <Field label="6-digit OTP" error={errors.otp?.message}>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      className="input flex-1"
                      placeholder="123456"
                      {...register('otp', {
                        pattern: { value: /^\d{6}$/, message: 'OTP must be 6 digits' }
                      })}
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={otpVerifying || !otpValue || otpValue.length !== 6}
                      className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-[11px] font-bold text-sky-700 transition hover:bg-sky-100 disabled:opacity-50"
                    >
                      {otpVerifying ? 'Verifying...' : phoneVerified ? 'Verified' : 'Verify'}
                    </button>
                  </div>
                </Field>

                <div className="sm:col-span-2">
                  <Field label="Organization / kitchen name" error={errors.organization_name?.message}>
                    <input
                      className="input"
                      placeholder="e.g. Spice Garden Restaurant / Hope Foundation"
                      {...register('organization_name', { required: 'Organization name is required' })}
                    />
                  </Field>
                </div>

                <div className="sm:col-span-2">
                  <Field label="Street address / area" error={errors.address?.message}>
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
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {serverError}
                </div>
              )}

              {infoMessage && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {infoMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-60 disabled:pointer-events-none"
              >
                {isSubmitting ? 'Creating your account...' : 'Create Account'}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-emerald-700 hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, error }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </label>
      {children}
      {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}
