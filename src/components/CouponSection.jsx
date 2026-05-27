import React, { useEffect, useState } from 'react';
import { Ticket, Copy, Check, Sparkles } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const CouponSection = ({ onApply, appliedCode }) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedCode, setCopiedCode] = useState('');

  useEffect(() => {
    const fetchActiveCoupons = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/coupons/active');
        setCoupons(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error('Error fetching active coupons:', err);
        setError('Could not load active offers.');
      } finally {
        setLoading(false);
      }
    };

    fetchActiveCoupons();
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code "${code}" copied to clipboard!`);
    setTimeout(() => {
      setCopiedCode('');
    }, 2000);
  };

  if (loading) {
    return (
      <div className="rounded-[2rem] border border-neutral-200 bg-white p-6 md:p-8 shadow-sm animate-pulse space-y-4">
        <div className="h-6 w-40 bg-neutral-200 rounded-lg"></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-24 bg-neutral-100 rounded-2xl"></div>
          <div className="h-24 bg-neutral-100 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (error || coupons.length === 0) {
    return null; // Don't show anything if there are no public active coupons or error occurs
  }

  return (
    <div className="rounded-[2rem] border border-pink-100 bg-gradient-to-tr from-pink-50/50 via-white to-purple-50/30 p-6 md:p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-pink-100 text-pink-500 rounded-2xl">
          <Ticket size={22} className="animate-pulse" />
        </div>
        <div>
          <h3 className="text-lg font-bold tracking-tight text-neutral-800 flex items-center gap-1.5 font-display">
            Available Coupons <Sparkles size={16} className="text-purple-400" />
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">Apply these premium codes at checkout for heavy discounts</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {coupons.map((coupon) => {
          const isApplied = appliedCode?.toUpperCase() === coupon.code.toUpperCase();
          const discountDisplay = coupon.type === 'PERCENTAGE' 
            ? `${coupon.percentage || coupon.value}% OFF` 
            : `₹${coupon.percentage || coupon.value} OFF`;

          return (
            <div 
              key={coupon.id} 
              className={`relative overflow-hidden rounded-2xl border transition-all ${isApplied ? 'border-pink-300 bg-pink-50/40 shadow-sm' : 'border-dashed border-neutral-300 hover:border-pink-300 bg-white'}`}
            >
              {/* Decorative Coupon Cut-outs */}
              <div className="absolute top-1/2 -left-2 w-4 h-4 bg-slate-50 border-r border-neutral-300 rounded-full transform -translate-y-1/2"></div>
              <div className="absolute top-1/2 -right-2 w-4 h-4 bg-slate-50 border-l border-neutral-300 rounded-full transform -translate-y-1/2"></div>

              <div className="p-5 flex flex-col justify-between h-full relative z-10 px-6">
                <div>
                  <span className="inline-block px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-pink-600 bg-pink-50 rounded-full mb-2">
                    {discountDisplay}
                  </span>
                  <div className="flex items-center justify-between gap-3 mt-1">
                    <span className="font-mono text-base font-black tracking-wider text-neutral-800">
                      {coupon.code}
                    </span>
                    <button
                      onClick={() => handleCopy(coupon.code)}
                      className="p-2 text-neutral-400 hover:text-pink-500 rounded-xl hover:bg-neutral-50 transition-colors"
                      title="Copy Coupon"
                    >
                      {copiedCode === coupon.code ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                    {coupon.type === 'PERCENTAGE' ? 'Percentage Discount' : 'Flat Discount'}
                  </span>
                  {onApply && (
                    <button
                      onClick={() => isApplied ? null : onApply(coupon.code)}
                      disabled={isApplied}
                      className={`text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-xl transition ${isApplied ? 'text-emerald-600 bg-emerald-50 cursor-default' : 'text-pink-600 hover:bg-pink-50/50'}`}
                    >
                      {isApplied ? 'APPLIED' : 'APPLY'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CouponSection;
