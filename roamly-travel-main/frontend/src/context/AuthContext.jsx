import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('roamly_token');
    if (token) {
      getMe()
        .then(res => setUser(res.data.user))
        .catch(() => { localStorage.removeItem('roamly_token'); localStorage.removeItem('roamly_user'); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const loginUser = (token, userData) => {
    localStorage.setItem('roamly_token', token);
    localStorage.setItem('roamly_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logoutUser = () => {
    localStorage.removeItem('roamly_token');
    localStorage.removeItem('roamly_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loginUser, logoutUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
