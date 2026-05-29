import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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

export default function TrackShipment() {
  const { user } = useAuth();
  const params = useParams();
  const initialAwb = (params.awb || '').trim();

  const [mode, setMode] = useState(initialAwb ? 'awb' : 'order'); // awb | order
  const [awbInput, setAwbInput] = useState(initialAwb);
  const [awb, setAwb] = useState(initialAwb);

  const [orderIdInput, setOrderIdInput] = useState('');
  const [contactMode, setContactMode] = useState('email'); // email | phone
  const [contactInput, setContactInput] = useState(user?.email || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tracking, setTracking] = useState(null);
  const [shipment, setShipment] = useState(null);
  const [events, setEvents] = useState([]);

  const labelUrl = useMemo(() => shipment?.labelUrl || null, [shipment?.labelUrl]);

  useEffect(() => {
    if (!initialAwb) return;
    setMode('awb');
    setAwbInput(initialAwb);
    setAwb(initialAwb);
  }, [initialAwb]);

  useEffect(() => {
    if (!awb) return;

    const run = async () => {
      setLoading(true);
      setError('');
      setTracking(null);
      setShipment(null);
      setEvents([]);

      try {
        const [shipmentRes, trackRes, timelineRes] = await Promise.all([
          api.get(`/public/shipping/shipment/${encodeURIComponent(awb)}`),
          api.get(`/public/shipping/track/${encodeURIComponent(awb)}`),
          api.get(`/public/shipping/timeline/${encodeURIComponent(awb)}`),
        ]);

        const shipmentData = shipmentRes.data?.data || null;
        const trackingData = trackRes.data?.tracking || null;
        const timelineData = timelineRes.data?.data || [];

        setShipment(shipmentData);
        setTracking(trackingData);
        setEvents(normalizeEvents(trackingData, timelineData));
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          'Failed to fetch tracking';
        setError(String(message));
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [awb]);

  const onSubmitAwb = (e) => {
    e.preventDefault();
    const next = (awbInput || '').trim();
    if (!next) return;
    setMode('awb');
    setAwb(next);
  };

  const onSubmitOrder = async (e) => {
    e.preventDefault();
    const orderId = (orderIdInput || '').trim();
    const contact = (contactInput || '').trim();
    if (!orderId || !contact) return;

    setLoading(true);
    setError('');
    setTracking(null);
    setShipment(null);
    setEvents([]);

    try {
      const payload = { orderId };
      if (contactMode === 'phone') payload.phone = contact;
      else payload.email = contact;

      const res = await api.post('/orders/track', payload);

      const nextAwb = res.data?.awb || res.data?.shipment?.awb || null;
      const trackingData = res.data?.tracking || null;
      const timelineData = res.data?.timeline || [];

      if (!nextAwb) {
        setError(res.data?.message || 'Shipment not created yet');
        return;
      }

      setMode('awb');
      setAwbInput(String(nextAwb));
      setAwb(String(nextAwb));

      if (res.data?.shipment) setShipment(res.data.shipment);
      if (trackingData) setTracking(trackingData);
      setEvents(normalizeEvents(trackingData, timelineData));
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to track order';
      setError(String(message));
    } finally {
      setLoading(false);
    }
  };

  const onDownloadLabel = async () => {
    try {
      const res = await api.get(`/public/shipping/label/${encodeURIComponent(awb)}`);
      const url = res.data?.label_url || res.data?.shipment?.labelUrl || null;
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
      else setError('Label URL is not available yet.');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to download label');
    }
  };

  return (
    <div className="pt-6 pb-10 container mx-auto px-6 max-w-5xl">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.35em] text-neutral-400">Shipment Tracking</p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-primary">Track your order</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Track with your Order ID + email/phone, or directly with AWB.
          </p>
        </div>
        <Link to="/shop" className="text-xs font-black uppercase tracking-widest underline text-neutral-700">
          Back to Shop
        </Link>
      </div>

      <div className="mt-8 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode('order')}
            className={`h-10 px-4 rounded-xl text-xs font-black uppercase tracking-widest border transition-colors ${
              mode === 'order' ? 'bg-primary text-white border-primary' : 'bg-white text-neutral-900 border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            Track by Order ID
          </button>
          <button
            type="button"
            onClick={() => setMode('awb')}
            className={`h-10 px-4 rounded-xl text-xs font-black uppercase tracking-widest border transition-colors ${
              mode === 'awb' ? 'bg-primary text-white border-primary' : 'bg-white text-neutral-900 border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            Track by AWB
          </button>
        </div>

        {mode === 'order' ? (
          <form onSubmit={onSubmitOrder} className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-3">
            <input
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              placeholder="Enter Order ID"
              className="lg:col-span-6 h-12 rounded-xl border border-neutral-200 px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-black/10"
            />
            <select
              value={contactMode}
              onChange={(e) => setContactMode(e.target.value)}
              className="lg:col-span-2 h-12 rounded-xl border border-neutral-200 px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-black/10 bg-white"
            >
              <option value="email">Email</option>
              <option value="phone">Phone</option>
            </select>
            <input
              value={contactInput}
              onChange={(e) => setContactInput(e.target.value)}
              placeholder={contactMode === 'phone' ? 'Enter phone number' : 'Enter email address'}
              className="lg:col-span-3 h-12 rounded-xl border border-neutral-200 px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-black/10"
            />
            <button
              type="submit"
              className="lg:col-span-1 h-12 px-6 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest disabled:opacity-50 hover:bg-[#002855] transition-colors"
              disabled={!orderIdInput.trim() || !contactInput.trim() || loading}
            >
              {loading ? '...' : 'Go'}
            </button>
          </form>
        ) : (
          <form onSubmit={onSubmitAwb} className="mt-4 flex flex-col sm:flex-row gap-3">
            <input
              value={awbInput}
              onChange={(e) => setAwbInput(e.target.value)}
              placeholder="Enter AWB number"
              className="flex-1 h-12 rounded-xl border border-neutral-200 px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-black/10"
            />
            <button
              type="submit"
              className="h-12 px-6 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest disabled:opacity-50 hover:bg-[#002855] transition-colors"
              disabled={!awbInput.trim() || loading}
            >
              {loading ? 'Loading...' : 'Track'}
            </button>
          </form>
        )}
      </div>

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {shipment ? (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-widest text-neutral-900">Shipment</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-neutral-500">AWB</span>
                <span className="font-semibold text-neutral-900">{shipment.awb}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-neutral-500">Courier</span>
                <span className="font-semibold text-neutral-900">{shipment.courier}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-neutral-500">Status</span>
                <span className="font-semibold text-neutral-900">{shipment.status}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={onDownloadLabel}
                className="h-11 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:bg-[#002855] transition-colors"
              >
                Download Label
              </button>

              {shipment?.orderId ? (
                <button
                  type="button"
                  onClick={() => downloadInvoice(shipment.orderId)}
                  className="h-11 rounded-xl border border-neutral-200 bg-white text-neutral-900 text-xs font-black uppercase tracking-widest flex items-center justify-center"
                >
                  Download Invoice
                </button>
              ) : null}

              {labelUrl ? (
                <a
                  href={labelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-neutral-500 underline mt-2"
                >
                  Open saved label URL
                </a>
              ) : null}
            </div>
          </div>

          <div className="lg:col-span-2 rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-widest text-neutral-900">Timeline</h2>

            {tracking ? (
              <p className="mt-2 text-xs text-neutral-500">
                Live status:{' '}
                <span className="font-semibold text-neutral-900">
                  {tracking.current_status || tracking.status || 'UNKNOWN'}
                </span>
              </p>
            ) : null}

            <div className="mt-6 space-y-4">
              {events.length ? (
                events.map((evt, index) => (
                  <div key={evt.id} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-black" />
                      {index < events.length - 1 ? <div className="w-px flex-1 bg-neutral-200 mt-1" /> : null}
                    </div>
                    <div className="flex-1 pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-sm font-black text-neutral-900">{evt.status}</p>
                        <p className="text-xs text-neutral-500">{evt.time ? formatDateTime(evt.time) : ''}</p>
                      </div>
                      {evt.location ? <p className="mt-1 text-xs text-neutral-500">{evt.location}</p> : null}
                      <p className="mt-1 text-sm font-black uppercase tracking-widest text-neutral-400">{evt.source}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4 text-sm text-neutral-600">
                  No tracking events yet. Please check again later.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
