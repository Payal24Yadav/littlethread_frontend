import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import CollectionDetails from './pages/CollectionDetails';
import TrackShipment from './pages/TrackShipment';
import MyOrders from './pages/MyOrders';
import OrderDetailCustomer from './pages/OrderDetailCustomer';
import Cart from './pages/Cart';
import About from './pages/About';
import Contact from './pages/Contact';
import ShippingExchanges from './pages/ShippingExchanges';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

import { Toaster } from 'react-hot-toast';

function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="bottom-center" />
      <ScrollToTop />
      <Navbar />
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:handle" element={<ProductDetails />} />
            <Route path="/collection/:id" element={<CollectionDetails />} />
            <Route path="/track" element={<TrackShipment />} />
            <Route path="/track/:awb" element={<TrackShipment />} />
            <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
            <Route path="/order/:id" element={<ProtectedRoute><OrderDetailCustomer /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/shipping-exchanges" element={<ShippingExchanges />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

export default App;
