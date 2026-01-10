import React from 'react';
import { Bell, Search, Menu } from 'lucide-react'; // Import Menu

const Header = ({ user, toggleSidebar }) => {
  return (
    <div className="bg-white h-16 border-b border-gray-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
      
      {/* LEFT SIDE: Hamburger (Mobile) + Search (Desktop) */}
      <div className="flex items-center gap-4">
        
        {/* MOBILE MENU BUTTON (Hidden on Desktop 'md:hidden') */}
        <button 
          onClick={toggleSidebar} 
          className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg focus:outline-none"
        >
          <Menu size={24} />
        </button>

        {/* SEARCH BAR (Hidden on Mobile 'hidden md:block') */}
        <div className="relative w-64 hidden md:block">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Global Search..." 
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border-none rounded-lg focus:ring-1 focus:ring-enikin-red outline-none" 
          />
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4 md:gap-6">
        
        <div className="relative cursor-pointer">
          <Bell size={20} className="text-gray-600 hover:text-enikin-red transition" />
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>
        </div>

        <div className="flex items-center gap-3">
          {/* Hide Name on Mobile to save space */}
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-gray-800">{user?.name}</p>
            <p className="text-xs text-gray-500">Agent</p>
          </div>
          <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600 border border-gray-100">
            {user?.name?.[0]}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;