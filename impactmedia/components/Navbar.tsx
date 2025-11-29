import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, MonitorPlay, Home } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    // Prevent scrolling when menu is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; }
  }, [location, isOpen]);

  const navLinks = [
    { name: 'Movies', path: '/movies' },
    { name: 'Casting', path: '/casting' },
    { name: 'Sponsors', path: '/sponsors' },
    { name: 'Donate', path: '/donate' },
  ];

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-500 border-b ${
        scrolled 
          ? 'bg-brand-bg/90 backdrop-blur-xl border-brand-border py-2' 
          : 'bg-transparent border-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group mr-8 z-50 relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white shadow-[0_0_15px_rgba(0,240,255,0.4)] group-hover:shadow-[0_0_25px_rgba(0,240,255,0.6)] transition-all duration-300">
                <MonitorPlay size={20} fill="currentColor" />
              </div>
              <span className="text-xl font-bold tracking-wider text-white hidden sm:block">
                AI IMPACT <span className="text-brand-primary drop-shadow-[0_0_5px_rgba(0,240,255,0.5)]">MEDIA</span>
              </span>
            </Link>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">
             <Link 
                to="/"
                className={`p-2 rounded-lg transition-all duration-200 hover:bg-white/10 mr-2 ${location.pathname === '/' ? 'text-brand-primary' : 'text-gray-400 hover:text-white'}`}
                title="Home"
             >
                <Home size={20} />
             </Link>

            <div className="flex items-baseline space-x-1 lg:space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.pathname === link.path
                      ? 'text-brand-primary bg-brand-primary/10'
                      : 'text-brand-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link 
                to="/login"
                className="text-brand-muted hover:text-white text-xs uppercase tracking-widest ml-4 px-3 py-2 border border-transparent hover:border-brand-border rounded-lg transition-all"
              >
                Admin
              </Link>
            </div>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="-mr-2 flex md:hidden items-center z-50 relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-full text-white bg-white/5 hover:bg-brand-primary/20 transition-all focus:outline-none"
            >
              {isOpen ? <X size={24} className="text-brand-primary" /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Full Screen Mobile Overlay */}
      <div 
        className={`fixed inset-0 z-40 bg-brand-bg/95 backdrop-blur-2xl transition-all duration-500 ease-in-out flex flex-col justify-center items-center ${
            isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        <div className="flex flex-col space-y-6 text-center w-full px-8">
            <Link
                to="/"
                className={`text-2xl font-black tracking-tight hover:text-brand-primary transition-colors ${
                    location.pathname === '/' ? 'text-brand-primary' : 'text-white'
                }`}
            >
                HOME
            </Link>
            
            {navLinks.map((link) => (
                <Link
                    key={link.name}
                    to={link.path}
                    className={`text-2xl font-black tracking-tight hover:text-brand-primary transition-colors ${
                        location.pathname === link.path ? 'text-brand-primary' : 'text-white'
                    }`}
                >
                    {link.name.toUpperCase()}
                </Link>
            ))}

            <div className="w-16 h-1 bg-white/10 mx-auto my-4 rounded-full"></div>

            <Link 
                to="/login"
                className="text-sm font-mono text-gray-500 hover:text-white uppercase tracking-widest"
            >
                Admin Mainframe
            </Link>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-brand-secondary to-brand-primary"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-brand-primary/5 rounded-full blur-3xl -z-10"></div>
      </div>
    </nav>
  );
};