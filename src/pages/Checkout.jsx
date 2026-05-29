import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import api, { clearApiCache } from '../utils/api';
import toast from 'react-hot-toast';
import { ShieldCheck, Truck, Lock, MapPin, Mail, User, CreditCard } from 'lucide-react';
import CouponSection from '../components/CouponSection';

const Checkout = () => {
  const { 
    cart, 
    cartTotal, 
    clearCart,
    coupon,
    couponLoading,
    couponError,
    discountAmount,
    finalTotal,
    applyCoupon,
    removeCoupon
  } = useCart();
  const { user, addAddress } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [couponCodeInput, setCouponCodeInput] = useState(coupon?.code || '');
  const [razorpayKey, setRazorpayKey] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [codConfig, setCodConfig] = useState({ codEnabled: false, codMaxAmount: 0, codCharges: 0 });
  const [formErrors, setFormErrors] = useState({});
  const [selectedAddressId, setSelectedAddressId] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    addressLabel: 'Home',
    address: '',
    apartment: '',
    city: '',
    state: '',
    pinCode: ''
  });

  const userAddresses = user?.addresses || [];

  const validateEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const normalizePhone = (value) => {
    let digits = String(value || '').replace(/\D/g, '');
    if (digits.length > 10 && digits.startsWith('91')) {
      digits = digits.slice(2);
    }
    return digits.slice(0, 10);
  };

  const validatePhone = (value) => {
    return /^[0-9]{10}$/.test(normalizePhone(value));
  };

  const validatePinCode = (value) => {
    return /^[0-9]{4,7}$/.test(value.trim());
  };

  const getInputClasses = (field) => {
    return `w-full h-10 border rounded-lg px-3 text-sm focus:outline-none transition-colors ${formErrors[field] ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-neutral-200 bg-white focus:border-primary'}`;
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Enter a valid email address';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      errors.phone = 'Enter a valid 10 digit phone number';
    }
    if (!formData.address.trim()) errors.address = 'Shipping address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.state.trim()) errors.state = 'State is required';
    if (!formData.pinCode.trim()) {
      errors.pinCode = 'PIN Code is required';
    } else if (!validatePinCode(formData.pinCode)) {
      errors.pinCode = 'Enter a valid PIN code';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }

    const fetchConfig = async () => {
      try {
        const res = await api.get('/payments/config');
        if (res.data?.razorpayKeyId) {
          setRazorpayKey(res.data.razorpayKeyId);
        }
        if (res.data) {
          setCodConfig({
            codEnabled: Boolean(res.data.codEnabled),
            codMaxAmount: Number(res.data.codMaxAmount || 0),
            codCharges: Number(res.data.codCharges || 0),
          });
        }
      } catch (err) {
        console.error('Failed to load payment config', err);
      }
    };
    fetchConfig();

    if (user) {
      const [firstName = '', ...rest] = (user.name || '').split(' ');
      setFormData((prev) => {
        const defaultData = {
          firstName: (prev.firstName || firstName || '').trim(),
          lastName: (prev.lastName || rest.join(' ') || '').trim(),
          email: (user.email || prev.email || '').trim(),
          phone: normalizePhone(prev.phone),
          addressLabel: (prev.addressLabel || 'Home').trim(),
          address: (prev.address || '').trim(),
          apartment: (prev.apartment || '').trim(),
          city: (prev.city || '').trim(),
          state: (prev.state || '').trim(),
          pinCode: (prev.pinCode || '').trim()
        };

        if (!prev.address && userAddresses.length > 0) {
          const saved = userAddresses[0];
          setSelectedAddressId(saved.id);
          return {
            ...defaultData,
            addressLabel: (saved.label || 'Home').trim(),
            address: (saved.address || '').trim(),
            apartment: (saved.apartment || '').trim(),
            city: (saved.city || '').trim(),
            state: (saved.state || '').trim(),
            pinCode: (saved.pinCode || '').trim(),
            phone: normalizePhone(saved.phone || prev.phone),
          };
        }

        return defaultData;
      });
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [cart, navigate, user, userAddresses]);

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    
    if (name === 'pinCode') {
      const pinValue = value.replace(/\D/g, '').slice(0, 6);
      setFormData(prev => ({ ...prev, pinCode: pinValue }));
      
      if (pinValue.length === 6) {
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${pinValue}`);
          const data = await res.json();
          if (data && data[0] && data[0].Status === 'Success') {
            const postOffice = data[0].PostOffice[0];
            setFormData(prev => ({
              ...prev,
              city: postOffice.District || postOffice.Region || prev.city,
              state: postOffice.State || prev.state
            }));
            setFormErrors(prev => ({ ...prev, city: null, state: null, pinCode: null }));
          }
        } catch (err) {
          console.error("Pincode API Error", err);
        }
      }
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: name === 'phone' ? normalizePhone(value) : value }));
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill all required fields correctly.');
      const firstError = document.querySelector('[data-invalid="true"]');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (paymentMethod === 'razorpay' && !razorpayKey) {
      toast.error("Payment system is not configured currently.");
      return;
    }

    if (!cart || cart.length === 0) {
      toast.error('Your cart is empty. Add items before checkout.');
      navigate('/cart');
      return;
    }

    if (!finalTotal && finalTotal !== 0) {
      toast.error('Invalid cart total. Please review your cart.');
      return;
    }

    if (user && addAddress) {
      addAddress({
        label: formData.addressLabel || 'Home',
        address: formData.address,
        apartment: formData.apartment,
        city: formData.city,
        state: formData.state,
        pinCode: formData.pinCode,
        phone: formData.phone,
      });
    }

    setLoading(true);

    try {
      const items = cart.map(item => ({
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        price: item.price,
        variantTitle: item.variantTitle || item.selectedSize,
        weight: item.weight,
        length: item.length,
        breadth: item.breadth,
        height: item.height,
      }));

      const orderDataPayload = {
        amount: finalTotal,
        couponCode: coupon?.code || null,
        customerEmail: formData.email,
        customerName: `${formData.firstName} ${formData.lastName}`.trim(),
        paymentMethod: paymentMethod,
        items,
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          apartment: formData.apartment,
          city: formData.city,
          state: formData.state,
          pinCode: formData.pinCode,
          addressLabel: formData.addressLabel,
          fullName: `${formData.firstName} ${formData.lastName}`.trim(),
          country: 'IN'
        }
      };

      const { data: orderResponse } = await api.post('/payments/create', orderDataPayload);

      if (paymentMethod === 'cod') {
        toast.success('Order placed with Cash on Delivery');
        clearApiCache((key) => key.includes('/orders'));
        if (clearCart) clearCart();
        navigate('/my-orders');
        return;
      }

      const options = {
        key: razorpayKey,
        amount: orderResponse.amount,
        currency: orderResponse.currency,
        name: 'Little Threads',
        description: 'Premium Kids Clothing',
        order_id: orderResponse.id,
        handler: async function (response) {
          try {
            toast.loading("Verifying payment...", { id: 'verify-toast' });
            const verifyRes = await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderData: orderDataPayload
            });

            if (verifyRes.data) {
              toast.success("Payment Successful!", { id: 'verify-toast' });
              clearApiCache((key) => key.includes('/orders'));
              if (clearCart) clearCart();
              navigate('/my-orders');
            }
          } catch (verifyErr) {
            console.error('Verification failed', verifyErr);
            toast.error(verifyErr.response?.data?.message || "Payment verification failed. Please contact support.", { id: 'verify-toast' });
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: '#003C71' // Changed to Little Threads Primary Navy
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response) {
        console.error('Razorpay payment failed:', response.error);
        toast.error(response.error?.description || "Payment Failed. Please try again.");
      });

      rzp.open();

    } catch (error) {
      console.error('Payment Error:', error);
      setLoading(false);
      const errorMessage = error.response?.data?.message || error.message || 'Something went wrong initiating payment.';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="bg-neutral-50 min-h-screen pt-8 pb-16 font-sans text-[#1d2432]">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header */}
        <div className="flex flex-col mb-8 border-b border-neutral-200 pb-4">
          <h1 className="text-3xl font-bold text-primary tracking-tight">Secure Checkout</h1>
          <p className="text-neutral-500 text-sm mt-1 flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-600" /> Review your items and complete payment securely.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Left Side: Forms */}
          <div className="lg:col-span-7 space-y-6">
            <form id="checkout-form" onSubmit={handlePayment} className="space-y-6">
              
              {/* Saved Addresses (if any) */}
              {userAddresses.length > 0 && (
                <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2 border-b border-neutral-100 pb-3">
                    <User size={18} /> Saved Delivery Addresses
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {userAddresses.map((address) => (
                      <button
                        key={address.id}
                        type="button"
                        onClick={() => {
                          setSelectedAddressId(address.id);
                          setFormData((prev) => ({
                            ...prev,
                            addressLabel: address.label || 'Home',
                            address: address.address || '',
                            apartment: address.apartment || '',
                            city: address.city || '',
                            state: address.state || '',
                            pinCode: address.pinCode || '',
                            phone: normalizePhone(address.phone || prev.phone),
                          }));
                        }}
                        className={`text-left rounded-lg border p-4 transition-all relative ${selectedAddressId === address.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-neutral-200 hover:border-primary/50 bg-white'}`}
                      >
                        <span className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-1 rounded-md">{address.label}</span>
                        <p className="text-sm font-semibold text-neutral-900 pr-12 leading-snug mb-1 truncate">{address.address}</p>
                        <p className="text-xs text-neutral-600">{address.city}, {address.state}</p>
                        <p className="text-xs text-neutral-500 mt-1 font-medium">{address.pinCode}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Info */}
              <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2 border-b border-neutral-100 pb-3">
                  <Mail size={18} /> Contact Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-700">Email Address</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className={getInputClasses('email')} placeholder="you@example.com" data-invalid={!!formErrors.email} />
                    {formErrors.email && <p className="text-[11px] text-red-500 font-medium">{formErrors.email}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-700">Phone Number</label>
                    <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className={getInputClasses('phone')} placeholder="10-digit number" inputMode="numeric" maxLength={10} data-invalid={!!formErrors.phone} />
                    {formErrors.phone && <p className="text-[11px] text-red-500 font-medium">{formErrors.phone}</p>}
                  </div>
                </div>
              </div>

              {/* Shipping Details */}
              <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2 border-b border-neutral-100 pb-3">
                  <MapPin size={18} /> Shipping Details
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-700">First Name</label>
                    <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className={getInputClasses('firstName')} placeholder="First name" data-invalid={!!formErrors.firstName} />
                    {formErrors.firstName && <p className="text-[11px] text-red-500 font-medium">{formErrors.firstName}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-700">Last Name</label>
                    <input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className={getInputClasses('lastName')} placeholder="Last name" data-invalid={!!formErrors.lastName} />
                    {formErrors.lastName && <p className="text-[11px] text-red-500 font-medium">{formErrors.lastName}</p>}
                  </div>
                </div>

                <div className="space-y-4 mb-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-700">Street Address</label>
                    <input required type="text" name="address" value={formData.address} onChange={handleInputChange} className={getInputClasses('address')} placeholder="House/Flat No, Street Name" data-invalid={!!formErrors.address} />
                    {formErrors.address && <p className="text-[11px] text-red-500 font-medium">{formErrors.address}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-700">Apartment, suite, etc. <span className="font-normal text-neutral-400">(optional)</span></label>
                    <input type="text" name="apartment" value={formData.apartment} onChange={handleInputChange} className="w-full h-10 border border-neutral-200 rounded-lg px-3 text-sm focus:outline-none focus:border-primary transition-colors bg-white" placeholder="Apartment, suite, landmark" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-700">City</label>
                    <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className={getInputClasses('city')} placeholder="City" data-invalid={!!formErrors.city} />
                    {formErrors.city && <p className="text-[11px] text-red-500 font-medium">{formErrors.city}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-700">State</label>
                    <input required type="text" name="state" value={formData.state} onChange={handleInputChange} className={getInputClasses('state')} placeholder="State" data-invalid={!!formErrors.state} />
                    {formErrors.state && <p className="text-[11px] text-red-500 font-medium">{formErrors.state}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-700">PIN Code</label>
                    <input required type="text" name="pinCode" value={formData.pinCode} onChange={handleInputChange} className={getInputClasses('pinCode')} placeholder="PIN Code" data-invalid={!!formErrors.pinCode} />
                    {formErrors.pinCode && <p className="text-[11px] text-red-500 font-medium">{formErrors.pinCode}</p>}
                  </div>
                </div>
                
                {user && (
                  <div className="space-y-1 border-t border-neutral-100 pt-4 mt-2">
                    <label className="text-xs font-semibold text-neutral-700">Save Address As <span className="font-normal text-neutral-400">(optional)</span></label>
                    <input type="text" name="addressLabel" value={formData.addressLabel} onChange={handleInputChange} className="w-full h-10 border border-neutral-200 rounded-lg px-3 text-sm focus:outline-none focus:border-primary transition-colors bg-white max-w-xs" placeholder="e.g. Home, Office" />
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Right Side: Order Summary & Payment */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Promo Code Section */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
              <h3 className="text-base font-bold text-neutral-900 mb-3">Promo Code</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="ENTER CODE"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                  disabled={couponLoading}
                  className="flex-1 bg-white border border-neutral-200 h-10 px-3 rounded-lg focus:outline-none focus:border-primary font-mono text-sm tracking-wider uppercase disabled:opacity-70"
                />
                {coupon ? (
                  <button
                    type="button"
                    onClick={() => {
                      removeCoupon();
                      setCouponCodeInput('');
                    }}
                    className="px-4 h-10 bg-red-50 text-red-600 font-bold text-xs rounded-lg hover:bg-red-100 transition-colors uppercase tracking-wider border border-red-100"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => applyCoupon(couponCodeInput, formData.email)}
                    disabled={couponLoading || !couponCodeInput.trim()}
                    className="px-4 h-10 bg-neutral-900 text-white font-bold text-xs rounded-lg hover:bg-neutral-800 transition-colors uppercase tracking-wider disabled:opacity-50"
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                )}
              </div>
              {couponError && <p className="text-[11px] text-red-500 mt-2 font-medium">{couponError}</p>}
            </div>

            <CouponSection 
              onApply={(code) => {
                setCouponCodeInput(code);
                applyCoupon(code, formData.email);
              }} 
              appliedCode={coupon?.code} 
            />

            {/* Order Summary Box */}
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
              <div className="p-6 bg-neutral-50/50 border-b border-neutral-200">
                <h3 className="text-lg font-bold text-neutral-900">Order Summary</h3>
              </div>
              
              <div className="p-6 space-y-4 max-h-[320px] overflow-y-auto custom-scrollbar">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.selectedSize}`} className="flex gap-3 bg-white border border-neutral-100 rounded-lg p-3">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-neutral-200 bg-neutral-50">
                      <img src={item.thumbnailUrl || item.images?.[0]} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <p className="text-sm font-semibold text-neutral-900 truncate">{item.name}</p>
                      <p className="text-[11px] font-medium text-neutral-500 mt-0.5">Size: {item.selectedSize}</p>
                    </div>
                    <div className="text-right flex flex-col justify-center">
                      <p className="text-sm font-bold text-neutral-900">₹{item.price * item.quantity}</p>
                      <p className="text-[11px] font-medium text-neutral-500 mt-0.5">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-neutral-50/50 border-t border-neutral-200 space-y-3 text-sm">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-neutral-900">₹{cartTotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount ({coupon?.code})</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-600">
                  <span>Shipping</span>
                  <span className="font-semibold text-emerald-600">FREE</span>
                </div>
                <div className="pt-3 border-t border-neutral-200 flex items-center justify-between">
                  <span className="text-lg font-bold text-neutral-900">Total</span>
                  <span className="text-2xl font-black text-primary">₹{finalTotal}</span>
                </div>
              </div>

              {/* Payment Selection */}
              <div className="p-6 border-t border-neutral-200">
                <h4 className="text-sm font-bold text-neutral-900 mb-3 flex items-center gap-2"><CreditCard size={16}/> Payment Method</h4>
                <div className="space-y-2">
                  <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${paymentMethod === 'razorpay' ? 'border-primary bg-primary/5' : 'border-neutral-200 hover:border-primary/30 bg-white'}`}>
                    <input type="radio" name="paymentMethod" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} className="w-4 h-4 text-primary focus:ring-primary" />
                    <span className="text-sm font-medium text-neutral-900">Pay Online (Razorpay)</span>
                  </label>
                  {codConfig.codEnabled && (
                    <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-neutral-200 hover:border-primary/30 bg-white'}`}>
                      <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-4 h-4 text-primary focus:ring-primary" />
                      <span className="text-sm font-medium text-neutral-900 flex-1">Cash on Delivery</span>
                      {codConfig.codCharges > 0 && <span className="text-xs font-bold text-neutral-500 bg-white border border-neutral-200 px-2 py-0.5 rounded">₹{codConfig.codCharges} Fee</span>}
                    </label>
                  )}
                </div>

                <button
                  type="submit"
                  form="checkout-form"
                  disabled={loading}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold tracking-wide text-white transition hover:bg-[#002855] disabled:cursor-not-allowed disabled:opacity-70 shadow-sm active:scale-[0.99]"
                >
                  {loading ? 'PROCESSING...' : <><Lock size={16} /> PAY SECURELY</>}
                </button>

                <div className="mt-4 flex items-center justify-center gap-6 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-emerald-600" /> Secure
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Truck size={14} className="text-emerald-600" /> Free Delivery
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
