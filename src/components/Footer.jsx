import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, MessageCircle, Globe, Play } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#fcfcfc] pt-12 pb-6 border-t border-neutral-100">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <Link to="/" className="flex item-center">
              <img src="/logo.png" alt="logo" className='h-20 w-auto' />
            </Link>
            <p className="text-neutral-500 text-xs leading-relaxed max-w-xs mt-2">
              Welcome to Little Threads — your trusted online shopping destination for premium kids clothing, baby essentials, toys, footwear, accessories, and more.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 text-neutral-600 hover:bg-primary hover:text-white transition-all">
                <Camera size={14} />
              </a>
              <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 text-neutral-600 hover:bg-primary hover:text-white transition-all">
                <MessageCircle size={14} />
              </a>
              <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 text-neutral-600 hover:bg-primary hover:text-white transition-all">
                <Globe size={14} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-primary mb-4 uppercase tracking-[0.1em]">Collections</h4>
            <ul className="space-y-2 text-xs text-neutral-500">
              <li><Link to="/shop?category=Newborn" className="hover:text-primary transition-colors">Newborn Essentials</Link></li>
              <li><Link to="/shop?category=Boys" className="hover:text-primary transition-colors">Boys Clothing</Link></li>
              <li><Link to="/shop?category=Girls" className="hover:text-primary transition-colors">Girls Clothing</Link></li>
              <li><Link to="/shop?category=Accessories" className="hover:text-primary transition-colors">Baby Accessories</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-primary mb-4 uppercase tracking-[0.1em]">Help & Info</h4>
            <ul className="space-y-2 text-xs text-neutral-500">
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">About Our Brand</Link></li>
              <li><Link to="/shipping-exchanges" className="hover:text-primary transition-colors">Shipping & Exchanges</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li className="pt-2 border-t border-neutral-100 mt-2">
                <span className="block font-bold mb-0.5">Email:</span>
                littlethreadsfashion@gmail.com
              </li>
              <li>
                <span className="block font-bold mb-0.5">Phone:</span>
                +91 9949471150
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-primary mb-4 uppercase tracking-[0.1em]">Newsletter</h4>
            <p className="text-xs text-neutral-500 mb-4 leading-relaxed">
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
            </p>
            <form className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Email address"
                className="w-full bg-white border border-neutral-200 px-3 py-2 text-xs focus:outline-none focus:border-primary transition-colors rounded-md"
              />
              <button className="w-full bg-primary text-white py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-[#002855] transition-colors rounded-md">
                Join Now
              </button>
            </form>
          </div>
        </div>

        <div className="pt-6 border-t border-neutral-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-neutral-400 text-[10px] uppercase tracking-widest">
            © 2026 Little threads. all rights reserved.
          </p>
          <p className="text-center text-gray-600 text-xs px-4">
            Crafted with ❤️ by
            <a
              href="https://www.novarsistech.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-600 hover:text-[#FF9933] ml-1 font-bold transition-colors"
            >
              Novarsis Technologies
            </a>
          </p>
          <div className="flex items-center space-x-6 hidden md:block">
            <div className="flex gap-2">
              <div className="w-8 h-5 bg-neutral-200 rounded"></div>
              <div className="w-8 h-5 bg-neutral-200 rounded"></div>
              <div className="w-8 h-5 bg-neutral-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
