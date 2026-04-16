import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [token, setToken]   = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const savedToken = localStorage.getItem('osms_token');
    const savedUser  = localStorage.getItem('osms_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, tokenValue) => {
    localStorage.setItem('osms_token', tokenValue);
    localStorage.setItem('osms_user', JSON.stringify(userData));
    setToken(tokenValue);
    setUser(userData);
    if (userData.userType === 'admin') navigate('/admin/dashboard');
    else navigate('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('osms_token');
    localStorage.removeItem('osms_user');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAdmin: user?.userType === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);