import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const Signup = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', gender: 'Male', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      toast.error('Please fill all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await signUp({ name: formData.name, email: formData.email, password: formData.password, gender: formData.gender });
      toast.success('Account created successfully');
      navigate('/profile');
    } catch (error) {
      toast.error(error.message || 'Sign up failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white p-10 shadow-xl">
        <div className="mb-10 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Join Little Threads</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900">Create your account</h1>
          <p className="mt-3 text-sm text-slate-500">Sign up once and save your favorite products, cart and checkout faster.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 block mb-2">Full name</label>
              <input
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition focus:border-primary"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 block mb-2">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition focus:border-primary"
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
                <option>Prefer not to say</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 block mb-2">Email</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition focus:border-primary"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 block mb-2">Password</label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition focus:border-primary"
                placeholder="Create a password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 block mb-2">Confirm password</label>
            <input
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition focus:border-primary"
              placeholder="Confirm your password"
            />
          </div>

          <button type="submit" className="w-full rounded-3xl bg-primary px-6 py-4 text-sm font-black uppercase tracking-[0.25em] text-white transition hover:bg-secondary">
            Create account
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-black text-slate-900 hover:text-primary">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
