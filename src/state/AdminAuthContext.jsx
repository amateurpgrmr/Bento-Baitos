import { createContext, useContext, useState, useEffect } from 'react';

const AdminAuthContext = createContext();

// Storage key constant
const ADMIN_AUTH_KEY = 'admin_auth';
const ADMIN_SESSION_KEY = 'admin_session_timestamp';

export function AdminAuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Initialize from localStorage immediately
    return localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is already logged in
    const adminAuth = localStorage.getItem(ADMIN_AUTH_KEY);
    const sessionTimestamp = localStorage.getItem(ADMIN_SESSION_KEY);

    if (adminAuth === 'true' && sessionTimestamp) {
      // Session remains valid - no timeout for admin
      setIsAuthenticated(true);
    } else if (adminAuth === 'true') {
      // Restore auth even without timestamp (backwards compatibility)
      setIsAuthenticated(true);
      localStorage.setItem(ADMIN_SESSION_KEY, Date.now().toString());
    }
    setLoading(false);
  }, []);

  // Persist auth state on every change
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem(ADMIN_AUTH_KEY, 'true');
      localStorage.setItem(ADMIN_SESSION_KEY, Date.now().toString());
    } else {
      localStorage.removeItem(ADMIN_AUTH_KEY);
      localStorage.removeItem(ADMIN_SESSION_KEY);
    }
  }, [isAuthenticated]);

  const login = (email, password) => {
    // Hardcoded credentials
    if (email === 'admin@bentobaitos.com' && password === 'currypeople') {
      setIsAuthenticated(true);
      localStorage.setItem(ADMIN_AUTH_KEY, 'true');
      localStorage.setItem(ADMIN_SESSION_KEY, Date.now().toString());
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(ADMIN_AUTH_KEY);
    localStorage.removeItem(ADMIN_SESSION_KEY);
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}
