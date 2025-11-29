import React from 'react';
import { Heart, Coffee } from 'lucide-react';
import { LiveBackground } from '../components/LiveBackground';

export const Donate: React.FC = () => {
  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 flex flex-col items-center relative overflow-hidden">
        <LiveBackground />
        
        <div className="relative z-10 w-full flex flex-col items-center">
            <div className="max-w-2xl text-center mb-10 sm:mb-16">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 sm:mb-6 leading-tight">SUPPORT INDEPENDENT <br className="hidden sm:block" /> CREATORS</h1>
                <p className="text-lg sm:text-xl text-gray-300 px-4">
                    Your contributions directly fund server costs, AI compute credits, and the artists building the future of media.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl px-2">
                <a 
                    href="https://www.paypal.me/AIImpactMedia" 
                    target="_blank" 
                    rel="noreferrer"
                    className="group glass-panel p-8 sm:p-10 rounded-2xl flex flex-col items-center justify-center hover:bg-blue-600/20 hover:border-blue-500 transition-all cursor-pointer transform hover:-translate-y-1"
                >
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                        <Heart fill="white" size={32} />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-center">PayPal</h3>
                    <p className="text-gray-400 text-sm text-center">One-time secure donation</p>
                </a>

                <a 
                    href="https://buymeacoffee.com/aiimpactmedia" 
                    target="_blank" 
                    rel="noreferrer"
                    className="group glass-panel p-8 sm:p-10 rounded-2xl flex flex-col items-center justify-center hover:bg-yellow-500/20 hover:border-yellow-500 transition-all cursor-pointer transform hover:-translate-y-1"
                >
                    <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                        <Coffee className="text-black" size={32} />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-center">Buy Me a Coffee</h3>
                    <p className="text-gray-400 text-sm text-center">Membership & Supporter Perks</p>
                </a>
            </div>
            
            <div className="mt-12 text-center relative z-10 max-w-lg px-6">
                <p className="text-brand-muted text-xs sm:text-sm">
                    AI Impact Media is a community-funded initiative. Transparency reports are available in the mainframe for all active supporters.
                </p>
            </div>
        </div>
    </div>
  );
};