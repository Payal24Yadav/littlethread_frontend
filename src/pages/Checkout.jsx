import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import api, { clearApiCache } from '../utils/api';
import toast from 'react-hot-toast';
import { ShieldCheck, Truck, Lock } from 'lucide-react';
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
    return `w-full bg-neutral-50 border px-5 py-4 rounded-xl focus:outline-none transition-colors ${formErrors[field] ? 'border-red-400/70 focus:border-red-500' : 'border-neutral-200 focus:border-primary'}`;
  };

  const getInputError = (field) => formErrors[field];

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

    // Load Razorpay script
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
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

    // Validate cart
    if (!cart || cart.length === 0) {
      toast.error('Your cart is empty. Add items before checkout.');
      navigate('/cart');
      return;
    }

    // Validate total amount
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

      console.log('📦 Checkout Payload:', {
        amount: finalTotal,
        couponCode: coupon?.code || null,
        itemCount: items.length,
        customerEmail: formData.email,
        customerName: `${formData.firstName} ${formData.lastName}`.trim(),
        paymentMethod: paymentMethod,
      });

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
      // 1. Create order
      console.log('🚀 Calling /api/payments/create...');
      const { data: orderResponse } = await api.post('/payments/create', orderDataPayload);

      // If COD selected, backend returns created order immediately
      if (paymentMethod === 'cod') {
        toast.success('Order placed with Cash on Delivery');
        clearApiCache((key) => key.includes('/orders'));
        if (clearCart) clearCart();
        navigate('/my-orders');
        return;
      }

      // 2. Setup Razorpay for online payment
      console.log('✅ Razorpay order created:', {
        orderId: orderResponse.id,
        amount: orderResponse.amount,
        currency: orderResponse.currency,
      });

      const options = {
        key: razorpayKey,
        amount: orderResponse.amount,
        currency: orderResponse.currency,
        name: 'Little Threads',
        description: 'Premium Kids Clothing',
        order_id: orderResponse.id, // Razorpay order ID
        handler: async function (response) {
          // 3. Verify Payment
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
          color: '#0a192f'
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
    <div className="min-h-screen bg-slate-50 py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-slate-500">Secure checkout</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">Complete your order</h1>
            <p className="mt-4 text-base leading-8 text-slate-600">Fill in your details below to place your order quickly and securely. We process payments safely and deliver your package with care.</p>
          </div>
        </div>

        <div className="grid gap-10 xl:grid-cols-[1.8fr_1fr]">
          <div>
            <form id="checkout-form" onSubmit={handlePayment} className="space-y-8">
              {userAddresses.length > 0 && (
                <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                  <div className="p-8 md:p-10">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-slate-500">Saved delivery address</p>
                        <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900">Choose an address</h2>
                      </div>
                    </div>

                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
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
                          className={`rounded-3xl border p-5 text-left transition ${selectedAddressId === address.id ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary'}`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">{address.label}</span>
                            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">{address.pinCode}</span>
                          </div>
                          <p className="mt-3 text-sm text-slate-700">{address.address}</p>
                          {address.apartment && <p className="mt-2 text-sm text-slate-500">{address.apartment}</p>}
                          <p className="mt-2 text-sm text-slate-500">{address.city}, {address.state}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </section>
              )}
              <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                <div className="p-8 md:p-10">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.4em] text-slate-500">Contact information</p>
                      <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900">Email & phone</h2>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-500 text-sm font-black text-white">1</div>
                  </div>

                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 block mb-3">Email address</label>
                      <input required type="email" name="email" value={formData.email || ''} onChange={handleInputChange} className={getInputClasses('email')} placeholder="you@example.com" data-invalid={!!formErrors.email} />
                      {formErrors.email && <p className="mt-2 text-sm text-rose-500">{formErrors.email}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 block mb-3">Phone number</label>
                      <input required type="tel" name="phone" value={formData.phone || ''} onChange={handleInputChange} className={getInputClasses('phone')} placeholder="9876543210" inputMode="numeric" maxLength={10} pattern="[0-9]{10}" data-invalid={!!formErrors.phone} />
                      {formErrors.phone && <p className="mt-2 text-sm text-rose-500">{formErrors.phone}</p>}
                    </div>
                  </div>
                </div>
              </section>

              <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                <div className="p-8 md:p-10">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.4em] text-slate-500">Shipping address</p>
                      <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900">Delivery details</h2>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-sm font-black text-white">2</div>
                  </div>

                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 block mb-3">First name</label>
                      <input required type="text" name="firstName" value={formData.firstName || ''} onChange={handleInputChange} className={getInputClasses('firstName')} placeholder="First name" data-invalid={!!formErrors.firstName} />
                      {formErrors.firstName && <p className="mt-2 text-sm text-rose-500">{formErrors.firstName}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 block mb-3">Last name</label>
                      <input required type="text" name="lastName" value={formData.lastName || ''} onChange={handleInputChange} className={getInputClasses('lastName')} placeholder="Last name" data-invalid={!!formErrors.lastName} />
                      {formErrors.lastName && <p className="mt-2 text-sm text-rose-500">{formErrors.lastName}</p>}
                    </div>
                  </div>

                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 block mb-3">Address label</label>
                      <input type="text" name="addressLabel" value={formData.addressLabel || ''} onChange={handleInputChange} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition focus:border-primary" placeholder="Home, Office, Parents" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 block mb-3">Phone</label>
                      <input required type="tel" name="phone" value={formData.phone || ''} onChange={handleInputChange} className={getInputClasses('phone')} placeholder="Phone number" inputMode="numeric" maxLength={10} pattern="[0-9]{10}" data-invalid={!!formErrors.phone} />
                      {formErrors.phone && <p className="mt-2 text-sm text-rose-500">{formErrors.phone}</p>}
                    </div>
                  </div>

                  <div className="mt-8 space-y-6">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 block mb-3">Address</label>
                      <input required type="text" name="address" value={formData.address || ''} onChange={handleInputChange} className={getInputClasses('address')} placeholder="House/Flat No, Street Name" data-invalid={!!formErrors.address} />
                      {formErrors.address && <p className="mt-2 text-sm text-rose-500">{formErrors.address}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 block mb-3">Apartment, suite, etc. <span className="text-slate-400">(optional)</span></label>
                      <input type="text" name="apartment" value={formData.apartment || ''} onChange={handleInputChange} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white" placeholder="Apartment, suite, etc." />
                    </div>
                  </div>

                  <div className="mt-8 grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 block mb-3">City</label>
                      <input required type="text" name="city" value={formData.city || ''} onChange={handleInputChange} className={getInputClasses('city')} placeholder="City" data-invalid={!!formErrors.city} />
                      {formErrors.city && <p className="mt-2 text-sm text-rose-500">{formErrors.city}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 block mb-3">State</label>
                      <input required type="text" name="state" value={formData.state || ''} onChange={handleInputChange} className={getInputClasses('state')} placeholder="State" data-invalid={!!formErrors.state} />
                      {formErrors.state && <p className="mt-2 text-sm text-rose-500">{formErrors.state}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 block mb-3">PIN Code</label>
                      <input required type="text" name="pinCode" value={formData.pinCode || ''} onChange={handleInputChange} className={getInputClasses('pinCode')} placeholder="PIN Code" data-invalid={!!formErrors.pinCode} />
                      {formErrors.pinCode && <p className="mt-2 text-sm text-rose-500">{formErrors.pinCode}</p>}
                    </div>
                  </div>
                </div>
              </section>
            </form>
          </div>

          <aside className="space-y-6">
            {/* Promo Code Input */}
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
              <h3 className="text-base font-bold text-slate-800 mb-3 font-display">Promo Code</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="ENTER CODE"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                  disabled={couponLoading}
                  className="flex-1 bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:border-primary font-mono text-sm tracking-wider uppercase disabled:opacity-70"
                />
                {coupon ? (
                  <button
                    type="button"
                    onClick={() => {
                      removeCoupon();
                      setCouponCodeInput('');
                    }}
                    className="px-4 py-3 bg-red-50 text-red-500 font-bold text-xs rounded-xl hover:bg-red-100 transition-colors uppercase tracking-widest"
                  >
                    REMOVE
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => applyCoupon(couponCodeInput, formData.email)}
                    disabled={couponLoading || !couponCodeInput.trim()}
                    className="px-4 py-3 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors uppercase tracking-widest disabled:opacity-50"
                  >
                    {couponLoading ? 'APPLYING...' : 'APPLY'}
                  </button>
                )}
              </div>
              {couponError && <p className="text-xs text-red-500 mt-2 font-medium">{couponError}</p>}
            </div>

            {/* Reusable Active Coupon Component */}
            <CouponSection 
              onApply={(code) => {
                setCouponCodeInput(code);
                applyCoupon(code, formData.email);
              }} 
              appliedCode={coupon?.code} 
            />
            <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8 text-white shadow-2xl">
              <div className="flex flex-col gap-4 text-slate-100">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.4em] text-slate-400">Order summary</p>
                  <h2 className="mt-3 text-3xl font-black tracking-tight text-white">Your bag</h2>
                </div>
                <p className="max-w-md text-sm leading-7 text-slate-300">Review your order items, total amount and payment details before placing the order. Your checkout is fully encrypted.</p>
              </div>

              <div className="mt-8 space-y-4 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.selectedSize}`} className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-3xl overflow-hidden bg-slate-900">
                        <img src={item.thumbnailUrl || item.images?.[0]} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{item.name}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">Size: {item.selectedSize}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-white">₹{item.price * item.quantity}</p>
                        <p className="text-xs text-slate-400">Qty {item.quantity}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-4 border-t border-white/10 pt-6 text-sm text-slate-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-white">₹{cartTotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Discount ({coupon?.code})</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-semibold text-emerald-400">FREE</span>
                </div>
              </div>

              <div className="mt-8 border-t border-white/10 pt-6">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xl font-black uppercase tracking-tight text-white">Total</span>
                  <span className="text-3xl font-black text-amber-400">₹{finalTotal}</span>
                </div>
                <div className="mt-4 mb-4 text-sm text-slate-200">
                  <label className="flex items-center gap-3">
                    <input type="radio" name="paymentMethod" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} />
                    <span className="ml-1">Pay Online (Razorpay)</span>
                  </label>
                  {codConfig.codEnabled && (
                    <label className="flex items-center gap-3 mt-2">
                      <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                      <span className="ml-1">Cash on Delivery {codConfig.codCharges ? `(₹${codConfig.codCharges} fee)` : ''}</span>
                    </label>
                  )}
                </div>
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={loading}
                  className="mt-6 flex w-full items-center justify-center gap-3 rounded-3xl bg-white px-6 py-4 text-sm font-black uppercase tracking-[0.2em] text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? 'PROCESSING...' : <><Lock size={18} /> PAY SECURELY</>}
                </button>

                <div className="mt-6 grid gap-3 text-xs text-slate-400 sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-400" /> Secure checkout
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck size={16} className="text-emerald-400" /> Free delivery
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
