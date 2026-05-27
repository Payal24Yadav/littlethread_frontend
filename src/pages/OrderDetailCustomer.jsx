import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext.jsx';
import { downloadInvoice } from '../utils/invoice';

const normalizeEvents = (tracking, persistedEvents) => {
  const activities = Array.isArray(tracking?.shipment_track_activities)
    ? tracking.shipment_track_activities
    : [];

  const fromLive = activities.map((a, idx) => ({
    id: `live_${idx}`,
    source: 'LIVE',
    status: a?.activity || a?.status || tracking?.current_status || tracking?.status || 'UNKNOWN',
    location: a?.location || a?.sr_location || '',
    time: a?.date || a?.event_time || a?.timestamp || null,
    raw: a,
  }));

  const fromDb = Array.isArray(persistedEvents)
    ? persistedEvents.map((e) => ({
        id: e.id,
        source: e.source || 'DB',
        status: e.status,
        location: '',
        time: e.eventTime,
        raw: e.raw,
      }))
    : [];

  const merged = [...fromDb, ...fromLive];
  merged.sort((left, right) => {
    const lt = left.time ? new Date(left.time).getTime() : 0;
    const rt = right.time ? new Date(right.time).getTime() : 0;
    return lt - rt;
  });

  return merged;
};

const formatDateTime = (value) => {
  try {
    return new Date(value).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
};

const getPaymentLabel = (order) => {
  const method = String(order?.paymentMethod || '').toLowerCase();
  if (method === 'cod') return 'Cash on Delivery';
  if (method.includes('razorpay')) return 'Razorpay';
  if (method) return method.toUpperCase();
  return 'Prepaid';
};

export default function OrderDetailCustomer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState('');
  const [tracking, setTracking] = useState(null);
  const [timeline, setTimeline] = useState([]);

  const shipment = order?.shipment || null;
  const awb = shipment?.awb || null;

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/orders/${encodeURIComponent(id)}`);
        setOrder(res.data || null);
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  useEffect(() => {
    if (!awb) return;

    const run = async () => {
      setTrackingLoading(true);
      setTrackingError('');
      setTracking(null);
      setTimeline([]);

      try {
        const [trackRes, timelineRes] = await Promise.all([
          api.get(`/public/shipping/track/${encodeURIComponent(awb)}`),
          api.get(`/public/shipping/timeline/${encodeURIComponent(awb)}`),
        ]);

        const trackingData = trackRes.data?.tracking || null;
        const timelineData = timelineRes.data?.data || [];

        setTracking(trackingData);
        setTimeline(normalizeEvents(trackingData, timelineData));
      } catch (err) {
        setTrackingError(err?.response?.data?.message || err?.message || 'Failed to fetch tracking');
      } finally {
        setTrackingLoading(false);
      }
    };

    run();
  }, [awb]);

  const customer = order?.customer || null;
  const address = order?.shippingAddress || {};

  if (loading) {
    return (
      <div className="pt-28 pb-16 container mx-auto px-6">
        <div className="h-6 w-60 bg-neutral-100 rounded" />
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 h-72 rounded-2xl border border-neutral-100 bg-white shadow-sm" />
          <div className="lg:col-span-2 h-72 rounded-2xl border border-neutral-100 bg-white shadow-sm" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="pt-28 pb-16 container mx-auto px-6">
        <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-800">
          {error || 'Order not found'}
        </div>
        <button
          type="button"
          onClick={() => navigate('/my-orders')}
          className="mt-6 h-11 px-6 rounded-xl bg-black text-white text-xs font-black uppercase tracking-widest"
        >
          Back to My Orders
        </button>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-16 container mx-auto px-6">
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.35em] text-neutral-400">Order details</p>
          <h1 className="mt-3 text-2xl sm:text-3xl font-black tracking-tight text-neutral-900">Order {order.id}</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Placed on <span className="font-semibold text-neutral-700">{formatDateTime(order.createdAt)}</span>
          </p>
        </div>
        <Link to="/my-orders" className="text-xs font-black uppercase tracking-widest underline text-neutral-700">
          Back to My Orders
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-widest text-neutral-900">Customer</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-neutral-500">Name</span>
              <span className="font-semibold text-neutral-900">{customer?.name || user?.name || '—'}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-neutral-500">Email</span>
              <span className="font-semibold text-neutral-900">{address?.email || customer?.email || user?.email || '—'}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-neutral-500">Phone</span>
              <span className="font-semibold text-neutral-900">{address?.phone || '—'}</span>
            </div>
          </div>

          <h3 className="mt-8 text-sm font-black uppercase tracking-widest text-neutral-900">Shipping</h3>
          <div className="mt-4 text-sm text-neutral-700 space-y-1">
            <p className="font-semibold text-neutral-900">{address?.fullName || `${address?.firstName || ''} ${address?.lastName || ''}`.trim() || '—'}</p>
            <p>{address?.address || '—'}</p>
            <p>
              {(address?.city || '—')}, {(address?.state || '—')} {address?.pinCode || ''}
            </p>
          </div>

          <h3 className="mt-8 text-sm font-black uppercase tracking-widest text-neutral-900">Payment</h3>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-neutral-500">Method</span>
              <span className="font-semibold text-neutral-900">{getPaymentLabel(order)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-neutral-500">Status</span>
              <span className="font-semibold text-neutral-900">{order.status || order.rawStatus || 'ORDERED'}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-neutral-500">Total</span>
              <span className="font-semibold text-neutral-900">₹{Number(order.totalAmount || order.total || 0).toFixed(0)}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => downloadInvoice(id)}
              className="h-11 rounded-xl bg-black text-white text-xs font-black uppercase tracking-widest flex items-center justify-center"
            >
              Download Invoice
            </button>
            {awb ? (
              <Link
                to={`/track/${encodeURIComponent(awb)}`}
                className="h-11 rounded-xl border border-neutral-200 bg-white text-neutral-900 text-xs font-black uppercase tracking-widest flex items-center justify-center"
              >
                Track Shipment
              </Link>
            ) : (
              <div className="h-11 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-500 text-xs font-black uppercase tracking-widest flex items-center justify-center">
                Shipment not created yet
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-widest text-neutral-900">Items</h2>

          <div className="mt-5 divide-y divide-neutral-100">
            {(order.items || []).map((item) => (
              <div key={item.id} className="py-4 flex items-start justify-between gap-6">
                <div className="min-w-0">
                  <p className="font-black text-neutral-900 truncate">{item.product?.name || 'Item'}</p>
                  {item.variantTitle ? <p className="mt-1 text-xs text-neutral-500">Variant: {item.variantTitle}</p> : null}
                  <p className="mt-1 text-xs text-neutral-500">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-neutral-900">₹{Number(item.price || 0).toFixed(0)}</p>
                </div>
              </div>
            ))}
          </div>

          <h2 className="mt-8 text-sm font-black uppercase tracking-widest text-neutral-900">Shipment</h2>
          {awb ? (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
                <p className="text-[11px] font-black uppercase tracking-widest text-neutral-400">AWB</p>
                <p className="mt-1 font-black text-neutral-900">{awb}</p>
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(String(awb))}
                  className="mt-3 text-xs font-black uppercase tracking-widest underline text-neutral-700"
                >
                  Copy AWB
                </button>
              </div>
              <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
                <p className="text-[11px] font-black uppercase tracking-widest text-neutral-400">Status</p>
                <p className="mt-1 font-black text-neutral-900">{shipment?.status || 'UNKNOWN'}</p>
                {shipment?.courier ? <p className="mt-2 text-xs text-neutral-500">{shipment.courier}</p> : null}
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-neutral-100 bg-neutral-50 p-4 text-sm text-neutral-600">
              Shipment not created yet. You’ll see AWB and tracking here once shipped.
            </div>
          )}

          {awb ? (
            <>
              <h2 className="mt-8 text-sm font-black uppercase tracking-widest text-neutral-900">Tracking</h2>
              {trackingError ? (
                <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-800">
                  {trackingError}
                </div>
              ) : null}

              {trackingLoading ? (
                <div className="mt-4 h-24 rounded-2xl border border-neutral-100 bg-neutral-50" />
              ) : null}

              {tracking ? (
                <p className="mt-3 text-xs text-neutral-500">
                  Live status:{' '}
                  <span className="font-semibold text-neutral-900">
                    {tracking.current_status || tracking.status || 'UNKNOWN'}
                  </span>
                </p>
              ) : null}

              <div className="mt-6 space-y-4">
                {timeline.length ? (
                  timeline.map((evt, index) => (
                    <div key={evt.id} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-3 w-3 rounded-full bg-black" />
                        {index < timeline.length - 1 ? <div className="w-px flex-1 bg-neutral-200 mt-1" /> : null}
                      </div>
                      <div className="flex-1 pb-3">
                        <div className="flex items-start justify-between gap-4">
                          <p className="text-sm font-black text-neutral-900">{evt.status}</p>
                          <p className="text-xs text-neutral-500">{evt.time ? formatDateTime(evt.time) : ''}</p>
                        </div>
                        {evt.location ? <p className="mt-1 text-xs text-neutral-500">{evt.location}</p> : null}
                        <p className="mt-1 text-[11px] font-black uppercase tracking-widest text-neutral-400">{evt.source}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4 text-sm text-neutral-600">
                    No tracking events yet. Please check again later.
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
