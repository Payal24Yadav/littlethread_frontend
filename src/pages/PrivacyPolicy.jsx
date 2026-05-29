import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, ShieldCheck, UserCheck } from 'lucide-react';

const sections = [
  {
    icon: <UserCheck size={22} />,
    title: 'Information We Collect',
    text: 'We collect details needed to process your orders, such as name, phone number, email address, shipping address, payment status, and order history.',
  },
  {
    icon: <ShieldCheck size={22} />,
    title: 'How We Use Information',
    text: 'Your information is used to confirm orders, process payments, arrange shipping, provide customer support, improve our store, and send order-related updates.',
  },
  {
    icon: <Lock size={22} />,
    title: 'Data Protection',
    text: 'We use reasonable safeguards to protect customer information. Payment processing is handled through trusted payment partners and sensitive payment details are not stored by Little Threads.',
  },
  {
    icon: <Mail size={22} />,
    title: 'Contact & Updates',
    text: 'You may contact us for privacy-related questions or corrections to your account details at littlethreadsfashion@gmail.com.',
  },
];

const PrivacyPolicy = () => {
  return (
    <main className="bg-[#fffaf5] pt-8 pb-20 md:pt-10">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-4xl text-center"
        >
          <p className="mb-4 text-xs font-black uppercase tracking-[0.28em] text-secondary">Little Threads</p>
          <h1 className="text-4xl font-black uppercase leading-none tracking-tight text-primary sm:text-5xl md:text-7xl">
            Privacy Policy
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base font-medium leading-8 text-neutral-600 sm:text-lg">
            This policy explains how Little Threads handles customer information when you browse, shop, create an account, or contact our support team.
          </p>
        </motion.section>

        <section className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2">
          {sections.map((section) => (
            <div key={section.title} className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                {section.icon}
              </div>
              <h2 className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-primary">{section.title}</h2>
              <p className="text-sm font-medium leading-7 text-neutral-600">{section.text}</p>
            </div>
          ))}
        </section>

        <section className="mt-12 rounded-lg bg-white p-6 shadow-sm ring-1 ring-neutral-200 md:p-10">
          <h2 className="mb-6 text-2xl font-black uppercase tracking-tight text-primary">Sharing & Retention</h2>
          <div className="space-y-5 text-sm font-medium leading-7 text-neutral-600">
            <p>We share only the information required with service providers such as payment gateways, courier partners, technology providers, and support tools so we can complete your purchase and deliver your order.</p>
            <p>We do not sell customer personal information. We retain order and support records as needed for operations, accounting, legal compliance, fraud prevention, and customer service.</p>
            <p>By using Little Threads, you agree to this policy. We may update it from time to time, and the latest version will be available on this page.</p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
