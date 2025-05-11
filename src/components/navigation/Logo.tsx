
import React from 'react';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link to="/" className="flex items-center gap-2">
      <div className="relative w-8 h-8 overflow-hidden">
        <img 
          src="https://img.icons8.com/fluency/96/travel-journal.png" 
          alt="Journey Nexus Logo" 
          className="w-full h-full object-contain"
        />
      </div>
      <span className="font-bold text-lg hidden sm:inline-block">Journey Nexus</span>
    </Link>
  );
};

export default Logo;
