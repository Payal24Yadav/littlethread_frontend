import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, logout, updateProfile, addAddress } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [gender, setGender] = useState(user?.gender || 'Prefer not to say');
  const [newAddress, setNewAddress] = useState({ label: 'Home', address: '', apartment: '', city: '', state: '', pinCode: '' });
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    updateProfile({ name, gender });
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddress.address.trim() || !newAddress.city.trim() || !newAddress.state.trim() || !newAddress.pinCode.trim()) {
      toast.error('Please fill in address, city, state and PIN code');
      return;
    }
    addAddress(newAddress);
    setNewAddress({ label: 'Home', address: '', apartment: '', city: '', state: '', pinCode: '' });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto rounded-[2rem] border border-slate-200 bg-white p-10 shadow-xl">
          <div className="mb-10 text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">My account</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900">Hello, {user.name}</h1>
            <p className="mt-3 text-sm text-slate-500">Manage your profile, saved addresses and recent activity.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-10">
            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400 mb-4">Order history</p>
              <p className="text-3xl font-black tracking-tight text-slate-900">0</p>
              <p className="text-sm text-slate-500 mt-3">No recent orders found. Your orders will appear here once you place them.</p>
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400 mb-4">Saved addresses</p>
              <p className="text-3xl font-black tracking-tight text-slate-900">{user.addresses?.length || 0}</p>
              <p className="text-sm text-slate-500 mt-3">Save delivery addresses here and autofill them at checkout.</p>
            </div>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1.4fr_0.95fr]">
            <div className="space-y-8">
              <section className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8">
                <h2 className="text-xl font-black mb-4">Personal Information</h2>
                <form onSubmit={handleUpdate} className="space-y-6">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 block mb-2">Full name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-4 text-slate-900 outline-none transition focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 block mb-2">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-4 text-slate-900 outline-none transition focus:border-primary"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                      <option>Prefer not to say</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 block mb-2">Email</label>
                    <input
                      value={user.email}
                      disabled
                      className="w-full rounded-3xl border border-slate-200 bg-slate-100 px-5 py-4 text-slate-500 outline-none"
                    />
                  </div>
                  <button type="submit" className="rounded-3xl bg-primary px-6 py-4 text-sm font-black uppercase tracking-[0.25em] text-white transition hover:bg-secondary">
                    Save changes
                  </button>
                </form>
              </section>

              <section className="rounded-[2rem] border border-slate-200 bg-white p-8">
                <h2 className="text-xl font-black mb-4">Security</h2>
                <p className="text-sm text-slate-500 mb-6">Sign out of your account on this device.</p>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="rounded-3xl bg-rose-500 px-6 py-4 text-sm font-black uppercase tracking-[0.25em] text-white transition hover:bg-rose-600"
                >
                  Sign out
                </button>
              </section>
            </div>

            <aside className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8 text-white shadow-2xl">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400 mb-4">Account summary</p>
              <div className="space-y-4 text-sm">
                <div className="rounded-3xl bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Name</p>
                  <p className="mt-3 text-lg font-black text-white">{user.name}</p>
                </div>

                <div className="rounded-3xl bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Email</p>
                  <p className="mt-3 text-lg font-black text-white">{user.email}</p>
                </div>

                <div className="rounded-3xl bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Saved addresses</p>
                  <p className="mt-3 text-lg font-black text-white">{user.addresses?.length || 0}</p>
                </div>

                <div className="rounded-3xl bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Member since</p>
                  <p className="mt-3 text-lg font-black text-white">{new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
                </div>
              </div>
            </aside>
            <section className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-black">Saved Addresses</h2>
                  <p className="text-sm text-slate-500">Your delivery addresses are available for checkout autofill.</p>
                </div>
              </div>

              {user.addresses?.length > 0 ? (
                <div className="space-y-4">
                  {user.addresses.map((address) => (
                    <div key={address.id} className="rounded-3xl border border-slate-200 bg-white p-5">
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <p className="text-sm font-black uppercase tracking-[0.25em] text-slate-500">{address.label}</p>
                        <span className="text-xs uppercase tracking-[0.2em] text-slate-400">{address.city}, {address.state}</span>
                      </div>
                      <p className="text-sm text-slate-700">{address.address}</p>
                      {address.apartment && <p className="mt-1 text-sm text-slate-600">{address.apartment}</p>}
                      <p className="mt-2 text-sm text-slate-600">PIN {address.pinCode}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-10 text-center text-slate-500">
                  No saved addresses yet.
                </div>
              )}
            </section>
          </div>

          <div className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black">Add address</h2>
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="rounded-full bg-slate-900 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white">Scroll to top</button>
            </div>
            <form onSubmit={handleAddAddress} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 block mb-2">Address label</label>
                  <input
                    name="label"
                    value={newAddress.label}
                    onChange={handleAddressChange}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition focus:border-primary"
                    placeholder="Home, Office, Parent's place"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 block mb-2">PIN Code</label>
                  <input
                    name="pinCode"
                    value={newAddress.pinCode}
                    onChange={handleAddressChange}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition focus:border-primary"
                    placeholder="PIN Code"
                  />
                </div>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 block mb-2">Address</label>
                  <input
                    name="address"
                    value={newAddress.address}
                    onChange={handleAddressChange}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition focus:border-primary"
                    placeholder="House/Flat No, Street Name"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 block mb-2">Apartment / Landmark</label>
                  <input
                    name="apartment"
                    value={newAddress.apartment}
                    onChange={handleAddressChange}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition focus:border-primary"
                    placeholder="Apartment, suite, etc."
                  />
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 block mb-2">City</label>
                  <input
                    name="city"
                    value={newAddress.city}
                    onChange={handleAddressChange}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition focus:border-primary"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 block mb-2">State</label>
                  <input
                    name="state"
                    value={newAddress.state}
                    onChange={handleAddressChange}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition focus:border-primary"
                    placeholder="State"
                  />
                </div>
              </div>
              <button type="submit" className="rounded-3xl bg-primary px-6 py-4 text-sm font-black uppercase tracking-[0.25em] text-white transition hover:bg-secondary">
                Save address
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
