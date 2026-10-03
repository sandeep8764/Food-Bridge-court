import { useForm } from 'react-hook-form';

const defaultValues = {
  food_name: '',
  food_category: 'Cooked Meals',
  description: '',
  quantity: '',
  quantity_unit: '',
  estimated_meals: '',
  preparation_time: '',
  expiry_time: '',
  pickup_start_time: '',
  pickup_end_time: '',
  address: '',
  city: '',
  state: '',
  latitude: '',
  longitude: '',
  image_url: ''
};

export default function DonationForm({ onSubmit, submitting = false, initialValues = defaultValues, submitLabel = 'Save Donation' }) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues: initialValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
      <Field label="Food Name" error={errors.food_name?.message}><input className="input" {...register('food_name', { required: 'Food name is required' })} /></Field>
      <Field label="Food Category" error={errors.food_category?.message}>
        <select className="input" {...register('food_category', { required: 'Food category is required' })}>
          {['Cooked Meals', 'Bakery', 'Fruits', 'Vegetables', 'Packaged Food', 'Dairy', 'Beverages', 'Other'].map((category) => <option key={category} value={category}>{category}</option>)}
        </select>
      </Field>
      <Field label="Description" className="md:col-span-2"><textarea className="input min-h-28" {...register('description')} /></Field>
      <Field label="Quantity" error={errors.quantity?.message}><input type="number" step="0.01" className="input" {...register('quantity', { required: 'Quantity is required' })} /></Field>
      <Field label="Quantity Unit" error={errors.quantity_unit?.message}><input className="input" {...register('quantity_unit', { required: 'Quantity unit is required' })} /></Field>
      <Field label="Estimated Meals" error={errors.estimated_meals?.message}><input type="number" className="input" {...register('estimated_meals', { required: 'Estimated meals is required' })} /></Field>
      <Field label="Preparation Time"><input type="datetime-local" className="input" {...register('preparation_time')} /></Field>
      <Field label="Expiry Time" error={errors.expiry_time?.message}><input type="datetime-local" className="input" {...register('expiry_time', { required: 'Expiry time is required' })} /></Field>
      <Field label="Pickup Start Time"><input type="datetime-local" className="input" {...register('pickup_start_time')} /></Field>
      <Field label="Pickup End Time"><input type="datetime-local" className="input" {...register('pickup_end_time')} /></Field>
      <Field label="Address" className="md:col-span-2" error={errors.address?.message}><input className="input" {...register('address', { required: 'Address is required' })} /></Field>
      <Field label="City" error={errors.city?.message}><input className="input" {...register('city')} /></Field>
      <Field label="State" error={errors.state?.message}><input className="input" {...register('state')} /></Field>
      <Field label="Latitude" error={errors.latitude?.message}><input type="number" step="0.0000001" className="input" {...register('latitude', { required: 'Latitude is required' })} /></Field>
      <Field label="Longitude" error={errors.longitude?.message}><input type="number" step="0.0000001" className="input" {...register('longitude', { required: 'Longitude is required' })} /></Field>
      <Field label="Image URL" className="md:col-span-2"><input className="input" {...register('image_url')} /></Field>
      <button disabled={submitting} className="md:col-span-2 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 disabled:opacity-60">
        {submitting ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}

function Field({ label, children, error, className = '' }) {
  return (
    <label className={`block space-y-1 ${className}`}>
      <span className="text-sm text-slate-300">{label}</span>
      {children}
      {error && <p className="text-sm text-red-400">{error}</p>}
    </label>
  );
}
