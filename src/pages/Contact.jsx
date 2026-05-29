import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Camera, MessageCircle, Play } from 'lucide-react';
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
    <div className="pt-8 md:pt-10 pb-16 md:pb-20 container mx-auto px-4 sm:px-6">
      <div className="text-center mb-12 md:mb-20 max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl md:text-8xl font-black uppercase tracking-tighter mb-4 leading-none">
          GET IN <span className="text-primary">TOUCH</span>
        </h1>
        <p className="text-neutral-500 text-base sm:text-lg font-medium px-4">
          Questions? Collabs? Just want to say hi? We're here.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-start">
        {/* Form */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 sm:p-8 md:p-12 lg:p-16 rounded-[2rem] md:rounded-[3rem] border border-neutral-200 shadow-[0_24px_80px_rgba(0,0,0,0.08)]"
        >
          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Your Name</label>
                <input 
                  name="name"
                  type="text" 
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe" 
                  required
                  className="w-full bg-neutral-50 text-neutral-900 placeholder:text-neutral-400 border border-neutral-200 px-5 py-4 rounded-2xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Email Address</label>
                <input 
                  name="email"
                  type="email" 
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com" 
                  required
                  className="w-full bg-neutral-50 text-neutral-900 placeholder:text-neutral-400 border border-neutral-200 px-5 py-4 rounded-2xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-colors"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Subject</label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full bg-neutral-50 text-neutral-900 border border-neutral-200 px-5 py-4 rounded-2xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-colors appearance-none"
              >
                <option>General Inquiry</option>
                <option>Order Support</option>
                <option>Collaborations</option>
                <option>Wholesale</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Message</label>
              <textarea 
                name="message"
                rows="5" 
                value={formData.message}
                onChange={handleChange}
                placeholder="What's on your mind?" 
                required
                className="w-full bg-neutral-50 text-neutral-900 placeholder:text-neutral-400 border border-neutral-200 px-5 py-4 rounded-2xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-colors resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 sm:py-5 bg-primary text-white font-black text-base sm:text-xl rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'SENDING...' : 'SEND MESSAGE'}
            </button>
          </form>
        </motion.div>

        {/* Info */}
        <div className="flex flex-col justify-between py-0 lg:py-10 gap-10 lg:gap-0">
          <div className="space-y-8 sm:space-y-10 lg:space-y-12">
            <div className="flex gap-5 sm:gap-6 items-start">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary flex-shrink-0">
                <Mail size={28} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight mb-1">Email Us</h3>
                <p className="text-neutral-500 font-medium break-all">littlethreadsfashion@gmail.com</p>
                <p className="text-neutral-500 font-medium">support@littlethreads.in</p>
              </div>
            </div>

            <div className="flex gap-5 sm:gap-6 items-start">
              <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary flex-shrink-0">
                <Phone size={28} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight mb-1">Call Us</h3>
                <p className="text-neutral-500 font-medium">+91 9949471150</p>
                <p className="text-neutral-500 font-medium">Mon - Sat: 10AM - 7PM</p>
              </div>
            </div>

            <div className="flex gap-5 sm:gap-6 items-start">
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 flex-shrink-0">
                <MapPin size={28} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight mb-1">Visit Studio</h3>
                <p className="text-neutral-500 font-medium">Third Floor, VVR Green Meadows,</p>
                <p className="text-neutral-500 font-medium">Attapur, Hyderabad, Telangana - 500030.</p>
              </div>
            </div>
          </div>

          <div className="pt-6 lg:pt-20">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-8 text-neutral-400">Join the Community</h3>
              <div className="flex gap-4 flex-wrap">
              <a href="#" className="p-5 bg-neutral-100 rounded-2xl hover:bg-primary hover:text-white transition-all">
                <Camera size={24} />
              </a>
              <a href="#" className="p-5 bg-neutral-100 rounded-2xl hover:bg-primary hover:text-white transition-all">
                <MessageCircle size={24} />
              </a>
              <a href="#" className="p-5 bg-neutral-100 rounded-2xl hover:bg-primary hover:text-white transition-all">
                <Play size={24} />
              </a>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
