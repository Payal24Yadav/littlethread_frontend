import React from 'react';
import { motion } from 'framer-motion';
import { PackageCheck, RefreshCw, Truck, ShieldCheck } from 'lucide-react';

const policyCards = [
  {
    icon: <Truck size={24} />,
    title: 'Shipping',
    text: 'Orders are processed after confirmation and shipped across serviceable locations in India. Delivery timelines may vary by pincode and courier availability.',
  },
  {
    icon: <PackageCheck size={24} />,
    title: 'Order Updates',
    text: 'You can track your shipment from the Track Order page using your AWB or shipment details once the order is dispatched.',
  },
  {
    icon: <RefreshCw size={24} />,
    title: 'Exchanges',
    text: 'Exchange requests are accepted for eligible items within the stated return window when products are unused, unwashed, and returned with original tags and packaging.',
  },
  {
    icon: <ShieldCheck size={24} />,
    title: 'Quality Check',
    text: 'Every exchange item is reviewed after pickup. Approved exchanges are processed based on product availability and the condition of the returned item.',
  },
];

const ShippingExchanges = () => {
  return (
    <main className="bg-[#fffaf5] pt-28 pb-20 md:pt-32">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-4xl text-center"
        >
          <p className="mb-4 text-xs font-black uppercase tracking-[0.28em] text-secondary">Help & Info</p>
          <h1 className="text-4xl font-black uppercase leading-none tracking-tight text-primary sm:text-5xl md:text-7xl">
            Shipping & Exchanges
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base font-medium leading-8 text-neutral-600 sm:text-lg">
            We want every Little Threads order to reach you smoothly and every exchange request to feel simple, clear, and parent-friendly.
          </p>
        </motion.section>

        <section className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2">
          {policyCards.map((item) => (
            <div key={item.title} className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {item.icon}
              </div>
              <h2 className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-primary">{item.title}</h2>
              <p className="text-sm font-medium leading-7 text-neutral-600">{item.text}</p>
            </div>
          ))}
        </section>

        <section className="mt-12 rounded-lg bg-white p-6 shadow-sm ring-1 ring-neutral-200 md:p-10">
          <h2 className="mb-6 text-2xl font-black uppercase tracking-tight text-primary">Important Notes</h2>
          <div className="space-y-5 text-sm font-medium leading-7 text-neutral-600">
            <p>Shipping timelines may be affected by holidays, weather, courier delays, incomplete addresses, or remote delivery locations.</p>
            <p>Products must be returned in original condition for exchange approval. Items showing use, damage, missing tags, or hygiene concerns may not be accepted.</p>
            <p>For support, contact us at littlethreadsfashion@gmail.com or call +91 9949471150 with your order details.</p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default ShippingExchanges;
