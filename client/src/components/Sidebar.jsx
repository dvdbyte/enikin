import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Building, Home, Users, UserCheck, FileText, LogOut, X 
} from 'lucide-react'; 
import { AuthContext } from '../context/AuthContext';

// Accept onClose prop
const Sidebar = ({ onClose }) => {
  const { logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Buildings', icon: Building, path: '/properties' },
    { name: 'Apartments', icon: Home, path: '/apartments' },
    { name: 'Tenants', icon: Users, path: '/tenants' },
    { name: 'Landlords', icon: UserCheck, path: '/landlords' },
    { name: 'Agreements', icon: FileText, path: '/leases' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-full bg-white border-r border-gray-100 flex flex-col relative">
      
      {/* HEADER  */}
      <div className="p-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-enikin-red tracking-tight">Enikin<span className="text-gray-800">.</span></h1>
        
        {/* Close Button only visible on mobile */}
        <button onClick={onClose} className="md:hidden text-gray-500 hover:text-red-500">
          <X size={24} />
        </button>
      </div>

      {/* MENU */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={onClose} 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                isActive 
                  ? 'bg-red-50 text-enikin-red' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon size={20} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="p-4 border-t border-gray-50">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;