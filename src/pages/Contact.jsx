import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      subject: formData.subject.trim(),
      message: formData.message.trim(),
    };

    if (!payload.name || !payload.email || !payload.message) {
      toast.error('Please fill name, email, and message.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/contact', payload);
      toast.success('Message sent successfully.');
      setFormData({
        name: '',
        email: '',
        subject: 'General Inquiry',
        message: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to send message.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen pb-16 font-sans text-[#1d2432]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main Header */}
        <div className="text-center mb-10 max-w-2xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold tracking-tight text-[#1d2432]"
          >
            Contact Us
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mt-3 text-neutral-500 text-sm leading-relaxed"
          >
            Questions about orders, collaborations, or Little Threads? We'd love to hear from you.
            Fill out the form or reach out directly through our contact metrics below.
          </motion.p>
        </div>

        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* LEFT SIDE: Info Boxes & Map */}
          <div className="lg:col-span-5 space-y-6">

            {/* 2x2 Grid of Quick Contact Blocks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              {/* Phone Card */}
              <div className="bg-white border border-[#f08375]/20 rounded-xl p-4 text-center flex flex-col items-center justify-center min-h-[135px] shadow-sm hover:shadow-md transition-shadow">
                <div className="w-9 h-9 rounded-full bg-[#f08375]/10 flex items-center justify-center text-[#f08375] mb-2">
                  <Phone size={18} />
                </div>
                <h3 className="font-bold text-xs text-[#1d2432] mb-0.5">Phone</h3>
                <p className="text-[11px] text-neutral-500 font-medium">+91 9949471150</p>
              </div>

              {/* WhatsApp Card */}
              <div className="bg-white border border-[#a187b4]/20 rounded-xl p-4 text-center flex flex-col items-center justify-center min-h-[135px] shadow-sm hover:shadow-md transition-shadow">
                <div className="w-9 h-9 rounded-full bg-[#a187b4]/10 flex items-center justify-center text-[#a187b4] mb-2">
                  <MessageSquare size={18} />
                </div>
                <h3 className="font-bold text-xs text-[#1d2432] mb-0.5">WhatsApp</h3>
                <p className="text-[11px] text-neutral-500 font-medium">+91 9949471150</p>
              </div>

              {/* Email Card */}
              <div className="bg-white border border-[#7fbba6]/20 rounded-xl p-4 text-center flex flex-col items-center justify-center min-h-[135px] shadow-sm hover:shadow-md transition-shadow">
                <div className="w-9 h-9 rounded-full bg-[#7fbba6]/10 flex items-center justify-center text-[#7fbba6] mb-2">
                  <Mail size={18} />
                </div>
                <h3 className="font-bold text-xs text-[#1d2432] mb-0.5">Email</h3>
                <p className="text-[11px] text-neutral-500 font-medium break-all px-1">support@littlethreads.in</p>
              </div>

              {/* Shop/Studio Card */}
              <div className="bg-white border border-[#f9b254]/20 rounded-xl p-4 text-center flex flex-col items-center justify-center min-h-[135px] shadow-sm hover:shadow-md transition-shadow">
                <div className="w-9 h-9 rounded-full bg-[#f9b254]/10 flex items-center justify-center text-[#f9b254] mb-2">
                  <MapPin size={18} />
                </div>
                <h3 className="font-bold text-xs text-[#1d2432] mb-0.5">Our Studio</h3>
                <p className="text-[11px] text-neutral-500 leading-tight">
                  Attapur, Hyderabad, <br /> Telangana - 500030
                </p>
              </div>

            </div>

            {/* Google Map Section */}
            <div className="w-full h-52 rounded-xl overflow-hidden border border-neutral-200 shadow-sm relative">
              <iframe
                title="Little Threads Location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3808.0443977533866!2d78.4191427!3d17.3616612!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb97abc64af0ad%3A0xcd306c529f798f02!2sAttapur%2C%20Hyderabad%2C%20Telangana!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin"
                className="w-full h-full border-0"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

          </div>

          {/* RIGHT SIDE: Contact Form */}
          <div className="lg:col-span-7 lg:pl-4">
            <div className="mb-5">
              <h2 className="text-2xl font-bold tracking-tight text-[#1d2432] mb-1">
                Get In Touch
              </h2>
              <p className="text-xs text-neutral-500 max-w-xl">
                Have an inquiry or custom styling choice? Share your notes here and our customer relation desk will follow up swiftly.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Name Input */}
              <div className="flex flex-col space-y-1">
                <label className="text-xs font-semibold text-[#1d2432]">
                  Name
                </label>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name..."
                  required
                  className="w-full h-10 border border-neutral-200 rounded-lg px-3 text-sm bg-white focus:outline-none focus:border-[#7fbba6] transition-colors"
                />
              </div>

              {/* Email Input */}
              <div className="flex flex-col space-y-1">
                <label className="text-xs font-semibold text-[#1d2432]">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="exemplar@yourmail.com"
                  required
                  className="w-full h-10 border border-neutral-200 rounded-lg px-3 text-sm bg-white focus:outline-none focus:border-[#7fbba6] transition-colors"
                />
              </div>

              {/* Subject Dropdown Select */}
              <div className="flex flex-col space-y-1">
                <label className="text-xs font-semibold text-[#1d2432]">
                  Subject
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full h-10 border border-neutral-200 rounded-lg px-3 text-sm bg-white focus:outline-none focus:border-[#7fbba6] transition-colors appearance-none"
                >
                  <option>General Inquiry</option>
                  <option>Order Support</option>
                  <option>Collaborations</option>
                  <option>Wholesale</option>
                </select>
              </div>

              {/* Message Input */}
              <div className="flex flex-col space-y-1">
                <label className="text-xs font-semibold text-[#1d2432]">
                  Message
                </label>
                <textarea
                  name="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Type Here..."
                  required
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#7fbba6] transition-colors resize-none"
                />
              </div>

              {/* Submit Button */}
              {/* Contact Component ke andar Submit Button Section */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-11 rounded-lg bg-[#1d2432] hover:bg-[#2d374c] text-white font-semibold text-sm tracking-wide transition-colors shadow-sm active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none"
                >
                  {submitting ? 'SENDING...' : 'Send Now'}
                </button>
              </div>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;