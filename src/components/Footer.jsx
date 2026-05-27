import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, MessageCircle, Globe, Play } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#fcfcfc] pt-20 pb-10 border-t border-neutral-100">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Link to="/" className="flex item-center justify-center ">
              <img src="/logo.png"  alt="logo" className='h-25 w-auto' />
            </Link>
            <p className="text-neutral-500 text-sm leading-relaxed max-w-xs mt-4">
              Welcome to Little Threads — your trusted online shopping destination for premium kids clothing, baby essentials, toys, footwear, accessories, and more.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-100 text-neutral-600 hover:bg-primary hover:text-white transition-all">
                <Camera size={18} />
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-100 text-neutral-600 hover:bg-primary hover:text-white transition-all">
                <MessageCircle size={18} />
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-100 text-neutral-600 hover:bg-primary hover:text-white transition-all">
                <Globe size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-primary mb-8 uppercase tracking-[0.1em]">Collections</h4>
            <ul className="space-y-4 text-sm text-neutral-500">
              <li><Link to="/shop?category=Newborn" className="hover:text-primary transition-colors">Newborn Essentials</Link></li>
              <li><Link to="/shop?category=Boys" className="hover:text-primary transition-colors">Boys Clothing</Link></li>
              <li><Link to="/shop?category=Girls" className="hover:text-primary transition-colors">Girls Clothing</Link></li>
              <li><Link to="/shop?category=Accessories" className="hover:text-primary transition-colors">Baby Accessories</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-primary mb-8 uppercase tracking-[0.1em]">Help & Info</h4>
            <ul className="space-y-4 text-sm text-neutral-500">
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">About Our Brand</Link></li>
              <li><Link to="/faq" className="hover:text-primary transition-colors">Shipping & Exchanges</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li className="pt-4 border-t border-neutral-100">
                <span className="block font-bold mb-1">Email:</span>
                littlethreadsfashion@gmail.com
              </li>
              <li>
                <span className="block font-bold mb-1">Phone:</span>
                +91 9949471150
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-primary mb-8 uppercase tracking-[0.1em]">Newsletter</h4>
            <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
            </p>
            <form className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Email address"
                className="w-full bg-white border border-neutral-200 px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
              />
              <button className="w-full bg-primary text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors">
                Join Now
              </button>
            </form>
          </div>
        </div>

        <div className="pt-10 border-t border-neutral-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-neutral-400 text-[11px] uppercase tracking-widest">
            © 2026 Little threads. all rights reserved.
          </p>
          <p className="text-center text-gray-600 text-sm mt-10 px-4">
          Crafted with ❤️ by  
          <a
            href="https://www.novarsistech.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-yellow-600 hover:text-[#FF9933] ml-1 text-md animate-pulse font-bold transition-colors"
          >
            Novarsis Technologies
          </a>
        </p>
          <div className="flex items-center space-x-6">
             <div className="flex gap-2">
                <div className="w-8 h-5 bg-neutral-100 rounded"></div>
                <div className="w-8 h-5 bg-neutral-100 rounded"></div>
                <div className="w-8 h-5 bg-neutral-100 rounded"></div>
                <div className="w-8 h-5 bg-neutral-100 rounded"></div>
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
