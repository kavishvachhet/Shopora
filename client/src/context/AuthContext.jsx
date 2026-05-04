import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      setCartCount(data.cartCount || 0);
    } catch {
      setUser(null);
      setCartCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.success) await fetchUser();
    return data;
  };

  const register = async (fullname, email, password) => {
    const { data } = await api.post('/auth/register', { fullname, email, password });
    if (data.success) await fetchUser();
    return data;
  };

  const logout = async () => {
    await api.get('/auth/logout');
    setUser(null);
    setCartCount(0);
  };

  return (
    <AuthContext.Provider value={{ user, cartCount, loading, login, register, logout, fetchUser, setCartCount }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
