import React from 'react';

export const LiveBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Deep Space Base */}
      <div className="absolute inset-0 bg-[#050505]"></div>
      
      {/* Moving Gradient blobs */}
      <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-brand-primary/10 rounded-full blur-[100px] animate-pulse-slow"></div>
      <div className="absolute top-[40%] -right-[10%] w-[60vw] h-[60vw] bg-brand-secondary/10 rounded-full blur-[120px] animate-pulse"></div>
      
      {/* Animated Grid Overlay */}
      <div 
          className="absolute inset-0 opacity-20"
          style={{
              backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
              maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)'
          }}
      ></div>
    </div>
  );
};