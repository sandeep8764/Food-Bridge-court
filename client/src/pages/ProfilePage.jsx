import { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { isSubmitting }
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      organization_name: user?.organization_name || '',
      address: user?.address || '',
      city: user?.city || '',
      state: user?.state || '',
      profile_image: user?.profile_image || ''
    }
  });

  const onSubmit = async (values) => {
    setError('');
    setMessage('');
    try {
      await api.put('/users/profile', values);
      await refreshUser();
      setMessage('Profile updated successfully');
    } catch (submissionError) {
      setError(submissionError?.response?.data?.message || 'Unable to update profile');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-800 bg-slate-900 p-8">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="mt-2 text-slate-400">Update your public profile details.</p>
        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Name" {...register('name')} />
          <Input label="Phone" {...register('phone')} />
          <Input label="Organization Name" {...register('organization_name')} />
          <Input label="Address" {...register('address')} />
          <Input label="City" {...register('city')} />
          <Input label="State" {...register('state')} />
          <Input label="Profile Image URL" className="md:col-span-2" {...register('profile_image')} />
          {message && <div className="md:col-span-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-emerald-200">{message}</div>}
          {error && <div className="md:col-span-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-200">{error}</div>}
          <button disabled={isSubmitting} className="md:col-span-2 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 disabled:opacity-60">
            {isSubmitting ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Input({ label, className = '', ...props }) {
  return (
    <label className={`block space-y-1 ${className}`}>
      <span className="text-sm text-slate-300">{label}</span>
      <input className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none" {...props} />
    </label>
  );
}
