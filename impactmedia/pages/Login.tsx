import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Lock, ArrowRight, AlertTriangle, Home, Mail } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.auth.login(email, password);
      localStorage.setItem('adminToken', response.token);
      navigate('/admin');
    } catch (err) {
      setError('Invalid Email or Password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 relative overflow-hidden">
      {/* Background FX */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black opacity-80"></div>
      <div className="absolute w-full h-full opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      
      {/* Home Exit */}
      <Link to="/" className="absolute top-6 left-6 text-gray-500 hover:text-white transition-colors z-50 p-2 glass-panel rounded-full">
         <Home size={24} />
      </Link>

      <div className="glass-panel p-8 md:p-12 rounded-2xl w-full max-w-md border border-white/5 relative z-10 shadow-2xl">
        <div className="flex justify-center mb-8 relative">
            <div className="absolute inset-0 bg-brand-primary/20 blur-xl rounded-full"></div>
            <div className="w-20 h-20 rounded-2xl bg-brand-surfaceHighlight border border-white/10 flex items-center justify-center relative z-10">
                <Lock className="text-brand-primary drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]" size={32} />
            </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-2 tracking-widest uppercase text-white">Mainframe Access</h2>
        <p className="text-center text-brand-muted text-xs mb-8 font-mono">AUTHORIZED PERSONNEL ONLY</p>
        
        {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-6 text-center text-sm flex items-center justify-center gap-2">
                <AlertTriangle size={16} /> {error}
            </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-5">
            <div>
                <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2 pl-1">Email ID</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                        type="email" 
                        placeholder="admin@impact.ai" 
                        className="input-field pl-10 bg-black/50"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoFocus
                        required
                    />
                </div>
            </div>
            <div>
                <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2 pl-1">Passcode</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                        type="password" 
                        placeholder="••••••••" 
                        className="input-field pl-10 bg-black/50 tracking-widest"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
            </div>
            <button 
                type="submit" 
                disabled={loading}
                className="w-full btn-primary py-4 flex items-center justify-center gap-2 group mt-4"
            >
                {loading ? 'AUTHENTICATING...' : 'INITIATE SESSION'}
                {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </button>
        </form>
        
        <div className="mt-8 text-center">
            <p className="text-[10px] text-gray-700 font-mono">
                SECURE CONNECTION V4.0.2 // ENCRYPTED
            </p>
        </div>
      </div>
    </div>
  );
};