import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ;

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const fetchUser = async () => {
        try {
          const res = await axios.get(`${API_URL}/api/auth/profile`);
          setUser(res.data);
        } catch (err) {
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          setUser(null);
        }
      };

      fetchUser();
    }
    setLoading(false);
  }, []);

  const login = async ( email, password) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, {  email, password });
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      setUser(res.data.user);
    } catch (err) {
      throw err; // Bubble to caller
    }
  };

  const register = async ( email, password) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, {  email, password });
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      setUser(res.data.user);
    } catch (err) {
      throw err;
    }
  };

  const logout = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('cart');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
