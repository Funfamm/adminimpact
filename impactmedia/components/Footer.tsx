import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-black border-t border-white/10 pt-10 pb-6">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-gray-400 text-sm mb-4">
          © {new Date().getFullYear()} AI Impact Media. All rights reserved.
        </p>
        <div className="flex justify-center space-x-6 text-sm text-gray-600">
          <a href="#" className="hover:text-brand-accent">Privacy Policy</a>
          <a href="#" className="hover:text-brand-accent">Terms of Service</a>
          <a href="#" className="hover:text-brand-accent">Contact</a>
        </div>
      </div>
    </footer>
  );
};