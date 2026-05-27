import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const storageKey = 'littlethreads_user';
const tokenStorageKey = 'littlethreads_token';

const getSafeUser = (account) => ({
  id: account.id,
  name: account.name,
  email: account.email,
  gender: account.gender || 'Prefer not to say',
  addresses: account.addresses || [],
  createdAt: account.createdAt,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(storageKey, JSON.stringify(user));
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [user]);

  const setToken = (token) => {
    const value = String(token || '').trim();
    if (value) localStorage.setItem(tokenStorageKey, value);
    else localStorage.removeItem(tokenStorageKey);
  };

  const signUp = async ({ name, email, password, gender = 'Prefer not to say' }) => {
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const response = await api.post('/auth/customer/signup/direct', {
        name: name.trim(),
        email: normalizedEmail,
        password,
        gender
      });

      const safeUser = getSafeUser(response.data.customer);
      setToken(response.data?.token || '');
      setUser(safeUser);
      return safeUser;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Signup failed';
      throw new Error(message);
    }
  };

  const login = async ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const response = await api.post('/auth/customer/login', {
        email: normalizedEmail,
        password
      });

      const safeUser = getSafeUser(response.data.customer);
      setToken(response.data?.token || '');
      setUser(safeUser);
      return safeUser;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Email and password do not match';
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore logout error; clear local session anyway
    }
    setToken('');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const resetPassword = async ({ email, password, confirmPassword }) => {
    const normalizedEmail = email.trim().toLowerCase();

    try {
      await api.post('/auth/customer/reset-password/direct', {
        email: normalizedEmail,
        password,
        confirmPassword: confirmPassword || password
      });

      return true;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Unable to reset password';
      throw new Error(message);
    }
  };

  const updateProfile = async ({ name, gender }) => {
    if (!user) return null;

    try {
      const response = await api.put(`/auth/customer/${user.id}/profile/direct`, {
        name: name.trim(),
        gender
      });
      const updatedUser = getSafeUser(response.data.customer);
      setUser(updatedUser);
      toast.success('Profile updated');
      return updatedUser;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Unable to update profile';
      throw new Error(message);
    }
  };

  const isSameAddress = (a, b) => {
    if (!a || !b) return false;
    return (
      a.address.trim().toLowerCase() === b.address.trim().toLowerCase() &&
      a.city.trim().toLowerCase() === b.city.trim().toLowerCase() &&
      a.state.trim().toLowerCase() === b.state.trim().toLowerCase() &&
      a.pinCode.trim() === b.pinCode.trim()
    );
  };

  const addAddress = async (address) => {
    if (!user) return null;

    const formatted = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      label: address.label || 'Home',
      address: address.address.trim(),
      apartment: address.apartment?.trim() || '',
      city: address.city.trim(),
      state: address.state.trim(),
      pinCode: address.pinCode.trim(),
      createdAt: new Date().toISOString(),
    };

    const existing = (user.addresses || []).some((item) => isSameAddress(item, formatted));
    if (existing) {
      return user.addresses.find((item) => isSameAddress(item, formatted));
    }

    try {
      const response = await api.put(`/auth/customer/${user.id}/addresses`, {
        addresses: [...(user.addresses || []), formatted]
      });

      const updatedCustomer = getSafeUser(response.data.customer);
      setUser(updatedCustomer);
      toast.success('Address saved');
      return formatted;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Unable to save address';
      throw new Error(message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signUp, logout, resetPassword, updateProfile, addAddress }}>
      {children}
    </AuthContext.Provider>
  );
};
