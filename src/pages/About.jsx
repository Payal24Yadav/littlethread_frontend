import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Heart, Truck, Star } from 'lucide-react';

const About = () => {
  return (
    <div className="pt-32 pb-20">
      <div className="container mx-auto px-6">
        <motion.h1 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-tight mb-20 text-center"
        >
          WHERE LITTLE STYLES <br /> CREATE <span className="text-primary">BIG SMILES</span>
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center mb-24">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl"
          >
            <img 
              src="https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=1000&auto=format&fit=crop" 
              alt="Kids Clothing" 
              className="w-full h-full object-cover"
            />
          </motion.div>
          <div className="space-y-6">
            <h2 className="text-4xl font-black uppercase tracking-tighter">OUR <span className="text-secondary">STORY</span></h2>
            <p className="text-neutral-600 text-lg leading-relaxed font-medium">
              Welcome to Little Threads — your trusted online shopping destination for premium kids clothing, baby essentials, toys, footwear, accessories, and more.
            </p>
            <p className="text-neutral-600 text-lg leading-relaxed font-medium">
              At Little Threads, we understand that parents want the perfect combination of comfort, quality, style, and affordability when shopping for their little ones. That’s why we carefully curate trendy and comfortable collections for newborns, infants, toddlers, and growing kids — all available conveniently through our online store.
            </p>
            <p className="text-neutral-600 text-lg leading-relaxed font-medium">
              From everyday wear and festive outfits to educational toys, stylish accessories, and baby essentials, we bring together everything your child needs in one place. Our mission is to make online shopping for kids easy, reliable, and enjoyable for every parent.
            </p>
          </div>
        </div>

        <div className="bg-neutral-50 rounded-[3rem] p-12 md:p-20 mb-24">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-center mb-16">WE FOCUS <span className="text-primary">ON</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              { icon: <Heart />, title: 'High-quality and kid-friendly fabrics' },
              { icon: <Star />, title: 'Trendy kids fashion for every season' },
              { icon: <ShieldCheck />, title: 'Affordable prices with exciting offers' },
              { icon: <ShieldCheck />, title: 'Safe, durable, and comfortable products' },
              { icon: <Truck />, title: 'Fast and hassle-free online shopping' },
              { icon: <Star />, title: 'Stylish collections for boys, girls, and babies' }
            ].map((feature, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="p-3 bg-white text-primary rounded-2xl shadow-sm border border-neutral-100">
                  {feature.icon}
                </div>
                <p className="font-bold text-neutral-800 leading-tight mt-2">{feature.title}</p>
              </div>
            ))}
          </div>
        </div>

        <section className="py-20 bg-[#0a192f] rounded-[3rem] p-12 md:p-20 text-center text-white overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary rounded-full blur-[120px]"></div>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-12 relative z-10">
            OUR <span className="text-[#e85d04]">GOAL</span>
          </h2>
          <div className="space-y-6 relative z-10">
            <p className="text-xl md:text-2xl font-medium max-w-4xl mx-auto leading-relaxed">
              Whether you’re shopping for cute baby clothes, party wear frocks, kids footwear, toys, or everyday essentials, Little Threads offers a wide range of products designed to keep your little ones happy and comfortable.
            </p>
            <p className="text-xl md:text-2xl font-medium max-w-4xl mx-auto leading-relaxed">
              Our goal is to become a trusted brand for parents looking for fashionable, affordable, and quality kids products online. With new arrivals, exciting deals, and carefully selected collections, Little Threads is here to make every childhood moment extra special.
            </p>
            <p className="text-2xl md:text-3xl font-black mt-8 text-[#e85d04]">
              Shop online with confidence at Little Threads!
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
