import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';

const Wishlist = () => {
  const { wishlist, toggleWishlist, addToCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <div className="pt-10 pb-20 container mx-auto px-6 text-center">
        <h2 className="text-4xl font-black mb-4">Your wishlist is empty</h2>
        <p className="text-neutral-500 mb-8">Save your favourite items and find them here anytime.</p>
        <Link to="/shop" className="btn-primary px-8 py-3">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="pt-10 pb-20 container mx-auto px-6">
      <h1 className="text-5xl font-bold mb-12">Saved <span className="text-secondary">Items</span></h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {wishlist.map((product) => (
          <div key={product.id} className="card p-4 flex flex-col">
            <div className="w-full aspect-[4/3] overflow-hidden rounded-xl mb-4">
              <img src={product.images?.[0]} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">{product.name}</h3>
              <p className="text-sm text-neutral-500">{product.category}</p>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="text-lg font-black">₹{product.price}</div>
              <div className="flex items-center gap-2">
                <button onClick={() => addToCart(product, product.sizes?.[0])} className="px-3 py-2 bg-primary text-white rounded-lg flex items-center gap-2">
                  <ShoppingCart size={16} /> Add
                </button>
                <button onClick={() => toggleWishlist(product)} className="p-2 text-neutral-500 hover:text-red-500">
                  <Trash2 />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
