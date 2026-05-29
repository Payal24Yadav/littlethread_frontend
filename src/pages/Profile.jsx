import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { User, MapPin, Package, LogOut, Plus, ShieldCheck, Mail, Calendar } from 'lucide-react';

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
    <div className="bg-neutral-50 min-h-screen pt-8 pb-16 font-sans text-[#1d2432]">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-neutral-200 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-primary tracking-tight">My Profile</h1>
            <p className="text-neutral-500 text-sm mt-1">Manage your account details and delivery addresses.</p>
          </div>
          <button 
            onClick={() => {
              logout();
              navigate('/');
            }} 
            className="mt-4 md:mt-0 flex items-center gap-2 text-sm font-semibold text-secondary hover:text-red-700 transition-colors bg-secondary/10 px-4 py-2 rounded-lg"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
           
           {/* Left side: Account Summary */}
           <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
                 <div className="flex items-center gap-4 mb-6 pt-2">
                    <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold shadow-md">
                       {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                       <h2 className="text-lg font-bold text-neutral-900 leading-tight">{user.name}</h2>
                       <p className="text-xs text-neutral-500 flex items-center gap-1 mt-1"><Mail size={12}/> {user.email}</p>
                    </div>
                 </div>
                 
                 <div className="space-y-4 pt-4 border-t border-neutral-100">
                    <div className="flex items-center justify-between text-sm">
                       <span className="text-neutral-500 flex items-center gap-2"><Calendar size={16} className="text-primary"/> Member Since</span>
                       <span className="font-semibold text-neutral-800">{new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                       <span className="text-neutral-500 flex items-center gap-2"><Package size={16} className="text-primary"/> Total Orders</span>
                       <span className="font-semibold text-neutral-800">0</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                       <span className="text-neutral-500 flex items-center gap-2"><MapPin size={16} className="text-primary"/> Saved Addresses</span>
                       <span className="font-semibold text-neutral-800">{user.addresses?.length || 0}</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Right side: Forms */}
           <div className="lg:col-span-8 space-y-6">
              
              {/* Personal Information */}
              <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
                 <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2 border-b border-neutral-100 pb-3">
                   <User size={18} /> Personal Information
                 </h3>
                 <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-1">
                     <label className="text-xs font-semibold text-neutral-700">Full Name</label>
                     <input
                       value={name}
                       onChange={(e) => setName(e.target.value)}
                       className="w-full h-10 border border-neutral-200 rounded-lg px-3 text-sm focus:outline-none focus:border-primary transition-colors bg-white"
                     />
                   </div>
                   <div className="space-y-1">
                     <label className="text-xs font-semibold text-neutral-700">Gender</label>
                     <select
                       value={gender}
                       onChange={(e) => setGender(e.target.value)}
                       className="w-full h-10 border border-neutral-200 rounded-lg px-3 text-sm focus:outline-none focus:border-primary transition-colors bg-white appearance-none"
                     >
                       <option>Male</option>
                       <option>Female</option>
                       <option>Other</option>
                       <option>Prefer not to say</option>
                     </select>
                   </div>
                   <div className="space-y-1 md:col-span-2">
                     <label className="text-xs font-semibold text-neutral-700">Email Address (Cannot be changed)</label>
                     <input
                       value={user.email}
                       disabled
                       className="w-full h-10 border border-neutral-200 rounded-lg px-3 text-sm bg-neutral-100 text-neutral-500 cursor-not-allowed"
                     />
                   </div>
                   <div className="md:col-span-2 pt-2">
                     <button type="submit" className="bg-primary text-white hover:bg-[#002855] w-full md:w-auto px-8 py-2.5 text-sm rounded-lg font-semibold transition-colors shadow-sm active:scale-[0.98]">
                       Save Changes
                     </button>
                   </div>
                 </form>
              </div>
              
              {/* Addresses Section */}
              <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 border-b border-neutral-100 pb-3 gap-2">
                   <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                     <MapPin size={18} /> Saved Addresses
                   </h3>
                   <p className="text-xs text-neutral-500">Available for fast checkout</p>
                 </div>

                 {/* Existing Addresses */}
                 {user.addresses?.length > 0 ? (
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                     {user.addresses.map((address) => (
                       <div key={address.id} className="border border-neutral-200 rounded-lg p-4 relative hover:border-primary transition-colors bg-neutral-50 group">
                         <span className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-1 rounded-md">{address.label}</span>
                         <p className="text-sm font-semibold text-neutral-900 pr-16 leading-snug mb-1">{address.address}</p>
                         {address.apartment && <p className="text-xs text-neutral-600 mb-0.5">{address.apartment}</p>}
                         <p className="text-xs text-neutral-600">{address.city}, {address.state} - <span className="font-medium">{address.pinCode}</span></p>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="bg-neutral-50 border border-dashed border-neutral-300 rounded-lg p-6 text-center mb-6">
                     <MapPin size={24} className="mx-auto text-neutral-400 mb-2"/>
                     <p className="text-sm text-neutral-600 font-medium">No saved addresses yet.</p>
                     <p className="text-xs text-neutral-500 mt-1">Add an address below for faster checkout.</p>
                   </div>
                 )}

                 {/* Add Address Form */}
                 <form onSubmit={handleAddAddress} className="mt-2 space-y-4">
                   <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                     <Plus size={16} className="text-primary"/> Add New Address
                   </h4>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-700">Address Label</label>
                        <input
                          name="label"
                          value={newAddress.label}
                          onChange={handleAddressChange}
                          className="w-full h-10 border border-neutral-200 rounded-lg px-3 text-sm focus:outline-none focus:border-primary transition-colors"
                          placeholder="e.g. Home, Office"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-700">PIN Code</label>
                        <input
                          name="pinCode"
                          value={newAddress.pinCode}
                          onChange={handleAddressChange}
                          className="w-full h-10 border border-neutral-200 rounded-lg px-3 text-sm focus:outline-none focus:border-primary transition-colors"
                          placeholder="6-digit PIN"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-semibold text-neutral-700">Street Address</label>
                        <input
                          name="address"
                          value={newAddress.address}
                          onChange={handleAddressChange}
                          className="w-full h-10 border border-neutral-200 rounded-lg px-3 text-sm focus:outline-none focus:border-primary transition-colors"
                          placeholder="House/Flat No, Street Name"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-semibold text-neutral-700">Apartment / Landmark</label>
                        <input
                          name="apartment"
                          value={newAddress.apartment}
                          onChange={handleAddressChange}
                          className="w-full h-10 border border-neutral-200 rounded-lg px-3 text-sm focus:outline-none focus:border-primary transition-colors"
                          placeholder="Optional landmark or apartment details"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-700">City</label>
                        <input
                          name="city"
                          value={newAddress.city}
                          onChange={handleAddressChange}
                          className="w-full h-10 border border-neutral-200 rounded-lg px-3 text-sm focus:outline-none focus:border-primary transition-colors"
                          placeholder="City"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-700">State</label>
                        <input
                          name="state"
                          value={newAddress.state}
                          onChange={handleAddressChange}
                          className="w-full h-10 border border-neutral-200 rounded-lg px-3 text-sm focus:outline-none focus:border-primary transition-colors"
                          placeholder="State"
                        />
                      </div>
                   </div>
                   <div className="pt-2">
                     <button type="submit" className="border-2 border-primary text-primary hover:bg-primary hover:text-white w-full md:w-auto px-6 py-2 text-sm rounded-lg font-semibold flex items-center gap-2 justify-center transition-colors active:scale-[0.98]">
                       Save Address
                     </button>
                   </div>
                 </form>
              </div>

           </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
