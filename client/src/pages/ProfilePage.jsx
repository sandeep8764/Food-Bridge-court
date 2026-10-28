import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const PROFILE_IMAGE_KEY = 'foodbridge_profile_image';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState(() => localStorage.getItem(PROFILE_IMAGE_KEY) || user?.profile_image || '');
  const {
    register,
    handleSubmit,
    setValue,
    formState: { isSubmitting }
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      organization_name: user?.organization_name || '',
      address: user?.address || '',
      city: user?.city || '',
      state: user?.state || '',
      profile_image: user?.profile_image || localStorage.getItem(PROFILE_IMAGE_KEY) || ''
    }
  });

  useEffect(() => {
    if (user?.profile_image) {
      setPreviewImage(user.profile_image);
      setValue('profile_image', user.profile_image);
    }
  }, [user, setValue]);

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      localStorage.setItem(PROFILE_IMAGE_KEY, dataUrl);
      setPreviewImage(dataUrl);
      setValue('profile_image', dataUrl, { shouldValidate: true });
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (values) => {
    setError('');
    setMessage('');
    try {
      const payload = {
        ...values,
        profile_image: values.profile_image || localStorage.getItem(PROFILE_IMAGE_KEY) || ''
      };
      await api.put('/users/profile', payload);
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

          <div className="md:col-span-2 space-y-2">
            <label className="block text-sm text-slate-300">Profile Image</label>
            <input type="file" accept="image/*" onChange={handleImageSelect} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200" />
            {previewImage && (
              <img src={previewImage} alt="Profile preview" className="mt-2 h-28 w-28 rounded-full object-cover border border-slate-700" />
            )}
            <input type="hidden" {...register('profile_image')} />
          </div>

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
