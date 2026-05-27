import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password.trim()) {
      toast.error('Email and new password are required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await resetPassword({ email: formData.email, password: formData.password });
      toast.success('Password has been reset. Please sign in.');
      navigate('/login');
    } catch (error) {
      toast.error(error.message || 'Unable to reset password');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white p-10 shadow-xl">
        <div className="mb-10 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Forgot password</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900">Reset your password</h1>
          <p className="mt-3 text-sm text-slate-500">Enter your email and choose a new secure password.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
            <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 block mb-2">New password</label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition focus:border-primary"
                placeholder="New password"
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
            <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 block mb-2">Confirm new password</label>
            <input
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition focus:border-primary"
              placeholder="Confirm password"
            />
          </div>

          <button type="submit" className="w-full rounded-3xl bg-primary px-6 py-4 text-sm font-black uppercase tracking-[0.25em] text-white transition hover:bg-secondary">
            Reset password
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          Remembered your password?{' '}
          <Link to="/login" className="font-black text-slate-900 hover:text-primary">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
