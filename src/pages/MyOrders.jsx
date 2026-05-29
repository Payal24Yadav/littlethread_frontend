import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cachedGet } from '../utils/api';
import { useAuth } from '../context/AuthContext.jsx';
import { downloadInvoice } from '../utils/invoice';

const formatDate = (value) => {
  try {
    return new Date(value).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
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

const getPrimaryItem = (order) => (Array.isArray(order?.items) && order.items.length ? order.items[0] : null);

const getImage = (product) => {
  if (product?.thumbnailUrl) return product.thumbnailUrl;
  const images = product?.images;
  if (Array.isArray(images) && images.length && typeof images[0] === 'string') return images[0];
  if (images && typeof images === 'object') {
    const first = Object.values(images).find((v) => typeof v === 'string');
    if (first) return first;
  }
  return null;
};

export default function MyOrders() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await cachedGet('/orders/my-orders', { cacheTtl: 15_000 });
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        setOrders(list);
      } catch (err) {
        if (err?.response?.status === 401) {
          setError('Your session expired. Please login again.');
          return;
        }
        setError(err?.response?.data?.message || err?.message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const empty = useMemo(() => !loading && !orders.length && !error, [loading, orders.length, error]);

  return (
    <div className="pt-8 pb-16 container mx-auto px-6">
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.35em] text-neutral-400">Account</p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-neutral-900">My Orders</h1>
          {user?.email ? <p className="mt-2 text-sm text-neutral-500">{user.email}</p> : null}
        </div>
        <Link to="/shop" className="text-xs font-black uppercase tracking-widest underline text-neutral-700">
          Continue shopping
        </Link>
      </div>

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
              <div className="h-4 w-40 bg-neutral-100 rounded" />
              <div className="mt-4 h-24 w-full bg-neutral-100 rounded-xl" />
            </div>
          ))}
        </div>
      ) : null}

      {empty ? (
        <div className="mt-10 rounded-3xl border border-neutral-100 bg-white p-10 text-center shadow-sm">
          <p className="text-sm font-black uppercase tracking-widest text-neutral-500">No orders yet</p>
          <p className="mt-2 text-sm text-neutral-500">Your order history will appear here after checkout.</p>
          <Link
            to="/shop"
            className="inline-flex mt-6 h-11 items-center justify-center rounded-xl bg-black px-6 text-xs font-black uppercase tracking-widest text-white"
          >
            Start shopping
          </Link>
        </div>
      ) : null}

      {!loading && orders.length ? (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {orders.map((order) => {
            const primary = getPrimaryItem(order);
            const product = primary?.product || null;
            const image = getImage(product);
            const qty = primary?.quantity || 0;
            const shipment = order?.shipment || null;

            return (
              <div
                key={order.id}
                className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-black uppercase tracking-widest text-neutral-400">Order</p>
                    <p className="mt-1 font-black text-neutral-900">{order.id}</p>
                    <p className="mt-2 text-xs text-neutral-500">
                      Placed on <span className="font-semibold text-neutral-700">{formatDate(order.createdAt)}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black uppercase tracking-widest text-neutral-400">Status</p>
                    <p className="mt-1 text-sm font-black text-neutral-900">{order.status || order.rawStatus || 'ORDERED'}</p>
                    {shipment?.status ? (
                      <p className="mt-1 text-xs text-neutral-500">
                        Shipment: <span className="font-semibold text-neutral-700">{shipment.status}</span>
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-neutral-500">Shipment not created yet</p>
                    )}
                  </div>
                </div>

                <div className="mt-5 flex gap-4">
                  <div className="h-20 w-20 rounded-xl bg-neutral-50 border border-neutral-100 overflow-hidden flex items-center justify-center">
                    {image ? (
                      <img src={image} alt={product?.name || 'Product'} className="h-full w-full object-cover" />
                    ) : (
                      <div className="text-sm font-black uppercase tracking-widest text-neutral-400">Item</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-neutral-900 truncate">{product?.name || 'Order items'}</p>
                    <p className="mt-1 text-xs text-neutral-500">
                      Qty: <span className="font-semibold text-neutral-700">{qty}</span>
                      {primary?.variantTitle ? (
                        <>
                          {' '}
                          • Variant: <span className="font-semibold text-neutral-700">{primary.variantTitle}</span>
                        </>
                      ) : null}
                    </p>
                    <p className="mt-2 text-xs text-neutral-500">
                      Payment: <span className="font-semibold text-neutral-700">{getPaymentLabel(order)}</span>
                      {order?.paymentStatus ? (
                        <span className="ml-2 font-semibold text-neutral-700">({String(order.paymentStatus).toUpperCase()})</span>
                      ) : null}
                      {order?.razorpayPaymentId ? (
                        <span className="ml-2 text-sm text-neutral-400">({order.razorpayPaymentId})</span>
                      ) : null}
                    </p>
                    {shipment?.awb ? (
                      <p className="mt-2 text-xs text-neutral-500">
                        AWB: <span className="font-semibold text-neutral-900">{shipment.awb}</span>
                        {shipment?.courier ? (
                          <>
                            {' '}
                            • <span className="font-semibold text-neutral-700">{shipment.courier}</span>
                          </>
                        ) : null}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(`/order/${order.id}`)}
                    className="h-11 px-5 rounded-xl bg-black text-white text-xs font-black uppercase tracking-widest"
                  >
                    View order
                  </button>
                  <button
                    type="button"
                    onClick={() => shipment?.awb && navigate(`/track/${encodeURIComponent(shipment.awb)}`)}
                    className="h-11 px-5 rounded-xl border border-neutral-200 bg-white text-neutral-900 text-xs font-black uppercase tracking-widest disabled:opacity-50"
                    disabled={!shipment?.awb}
                  >
                    Track shipment
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadInvoice(order.id)}
                    className="h-11 px-5 rounded-xl border border-neutral-200 bg-white text-neutral-900 text-xs font-black uppercase tracking-widest flex items-center justify-center"
                  >
                    Download invoice
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
