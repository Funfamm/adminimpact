import React, { createContext, useContext, useState, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ChatAssistant } from './components/ChatAssistant';
import { Home } from './pages/Home';
import { Movies } from './pages/Movies';
import { Casting } from './pages/Casting';
import { Sponsors } from './pages/Sponsors';
import { Donate } from './pages/Donate';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/AdminDashboard';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

// --- Toast System ---
type ToastType = 'success' | 'error';
interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

const ToastContainer: React.FC<{ toasts: Toast[]; removeToast: (id: string) => void }> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-24 right-4 z-[60] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div 
          key={toast.id} 
          className={`flex items-center gap-3 min-w-[300px] p-4 rounded-lg shadow-xl backdrop-blur-md border animate-float transition-all ${
            toast.type === 'success' 
              ? 'bg-brand-surface/90 border-green-500/50 text-white' 
              : 'bg-brand-surface/90 border-red-500/50 text-white'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle className="text-green-400" size={20} /> : <AlertCircle className="text-red-400" size={20} />}
          <p className="flex-1 text-sm font-medium">{toast.message}</p>
          <button onClick={() => removeToast(toast.id)} className="text-gray-400 hover:text-white">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

// --- Layout ---

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isLoginRoute = location.pathname === '/login';

  // Scroll to top on route change
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col selection:bg-brand-primary selection:text-black">
      {!isAdminRoute && !isLoginRoute && <Navbar />}
      <main className="flex-grow relative">
        {children}
      </main>
      {!isAdminRoute && !isLoginRoute && <Footer />}
      <ChatAssistant />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/casting" element={<Casting />} />
            <Route path="/sponsors" element={<Sponsors />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </Layout>
      </Router>
    </ToastProvider>
  );
};

export default App;