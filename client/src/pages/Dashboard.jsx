import React, { useState, useEffect, useContext } from 'react';
import { 
  Users, Home, Wallet, Bell, MessageCircle, TrendingUp, 
  AlertCircle, Building, Briefcase, CheckCircle 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../api';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  
  // STATS STATE
  const [stats, setStats] = useState({
    totalTenants: 0,
    totalUnits: 0,
    vacantUnits: 0,
    activeLeases: 0,
    totalVolume: 0, 
    agencyRevenue: 0 
  });

  // NOTIFICATIONS STATE
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch All Required Data in Parallel
      const [tenantsRes, aptRes, leasesRes, notifRes] = await Promise.all([
        API.get(`/tenants?agentId=${user._id}`),
        API.get(`/apartments?agentId=${user._id}`),
        API.get(`/leases?agentId=${user._id}`),
        API.get(`/leases/notifications?agentId=${user._id}`)
      ]);

      const apartments = aptRes.data;
      const leases = leasesRes.data;
      const rawNotifications = notifRes.data;

      // 2. CALCULATE STATS
      const activeLeases = leases.filter(l => l.status === 'Active');
      
      // Calculate Total Money Flow (Rent + All Fees)
      const totalVolume = activeLeases.reduce((sum, l) => sum + (l.totalPackage || 0), 0);

      // Calculate AGENT'S Profit (Agency + Legal)
      const agencyRevenue = activeLeases.reduce((sum, l) => {
        return sum + (l.agencyFee || 0) + (l.legalFee || 0);
      }, 0);

      setStats({
        totalTenants: tenantsRes.data.length,
        totalUnits: apartments.length,
        vacantUnits: apartments.filter(a => a.status === 'Vacant').length,
        activeLeases: activeLeases.length,
        totalVolume,
        agencyRevenue
      });

      // 3. NOTIFICATIONS
      const enrichedNotifications = rawNotifications.map(notif => {
        const lease = leases.find(l => l._id === notif.leaseId);
        return {
           ...notif,
           tenantName: lease?.tenantId?.name || 'Tenant',
           tenantPhone: lease?.tenantId?.phone || '',
           propertyTitle: lease?.apartmentId?.propertyId?.title || 'Property',
           unitNumber: lease?.apartmentId?.name || 'name'
        };
      });

      setNotifications(enrichedNotifications);

    } catch (err) {
      console.error("Dashboard Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- WHATSAPP SCRIPT GENERATOR ---
  const getWhatsAppLink = (n) => {
    let text = "";
    
    // 1. 90 DAYS (Renewal Notice)
    if (n.daysRemaining === 90) {
      text = `Good afternoon ${n.tenantName}. Trust you are well. We are reviewing our records and noticed your tenancy at ${n.propertyTitle} expires in 3 months. Please let us know if you intend to renew so we can prepare the paperwork. Thanks.`;
    } 
    // 2. 30 DAYS (Invoice)
    else if (n.daysRemaining === 30) {
      text = `Hello ${n.tenantName}. Hope you are having a good month. This is a reminder that your rent for ${n.unitNumber} at ${n.propertyTitle} is due in 30 days. Please plan accordingly. Thanks.`;
    } 
    // 3. 7 DAYS (Urgent Nudge)
    else if (n.daysRemaining === 7) {
      text = `Hi ${n.tenantName}, just a friendly reminder that your rent is due in exactly one week. Please facilitate payment to avoid delays. Thanks!`;
    } 
    // 4. DUE DATE (Critical)
    else if (n.daysRemaining <= 0) {
      text = `Good morning ${n.tenantName}. Your rent is due today. Please confirm if the transfer has been made so we can issue your receipt. Thank you.`;
    } else {
      // Default fallback
      text = `Hello ${n.tenantName}, this is a reminder regarding your property at ${n.propertyTitle}.`;
    }

    // Format Phone for Nigeria (Convert 080... to 23480...)
    let phone = n.tenantPhone ? n.tenantPhone.replace(/\s+/g, '') : ''; 
    if (phone.startsWith('0')) phone = '234' + phone.substring(1);

    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  // Helper for UI Colors
  const getUrgencyColor = (days) => {
    if (days === 90) return 'bg-blue-100 text-blue-600'; // Info
    if (days === 30) return 'bg-yellow-100 text-yellow-600'; // Warning
    if (days === 7) return 'bg-orange-100 text-orange-600'; // Urgent
    return 'bg-red-100 text-red-600'; // Critical
  };

  const formatNaira = (val) => '₦' + (val || 0).toLocaleString();

  if (loading) return <div className="p-8 text-center text-gray-500">Loading your command center...</div>;

  return (
    <div className="p-8">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Overview</h1>
          <p className="text-gray-500">Welcome back, {user?.name}.</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-lg">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Card 1: Agency Revenue */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 rounded-xl shadow-lg border border-gray-700 relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-2 -translate-y-2">
             <Wallet size={100} />
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-2 bg-white/10 rounded-lg"><Wallet size={20} /></div>
            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full flex items-center gap-1">
              <TrendingUp size={12}/> Profit
            </span>
          </div>
          <h3 className="text-gray-300 text-xs uppercase font-bold tracking-wider relative z-10">Agreement & Commission</h3>
          <p className="text-2xl font-bold mt-1 relative z-10">{formatNaira(stats.agencyRevenue)}</p>
        </div>

        {/* Card 2: Total Volume */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Briefcase size={20} /></div>
          </div>
          <h3 className="text-gray-500 text-xs uppercase font-bold tracking-wider">Total Volume Handled</h3>
          <p className="text-2xl font-bold text-gray-800 mt-1">{formatNaira(stats.totalVolume)}</p>
        </div>

        {/* Card 3: Portfolio Health */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Home size={20} /></div>
          </div>
          <h3 className="text-gray-500 text-xs uppercase font-bold tracking-wider">Portfolio Health</h3>
          <div className="flex items-end gap-2 mt-1">
            <p className="text-2xl font-bold text-gray-800">{stats.totalUnits}</p>
            <span className="text-sm text-gray-400 mb-1">Total Units</span>
          </div>
          <p className={`text-xs mt-2 font-medium ${stats.vacantUnits > 0 ? 'text-red-500' : 'text-green-500'}`}>
            {stats.vacantUnits > 0 ? `${stats.vacantUnits} Vacant Units` : '100% Occupied'}
          </p>
        </div>

        {/* Card 4: Tenants */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Users size={20} /></div>
          </div>
          <h3 className="text-gray-500 text-xs uppercase font-bold tracking-wider">Active Tenants</h3>
          <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalTenants}</p>
        </div>
      </div>

      {/* NOTIFICATIONS & ACTIONS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ALERTS PANEL */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
              <Bell size={20} className="text-enikin-red" />
              Smart Alerts
            </h2>
            <Link to="/leases" className="text-sm text-enikin-red hover:underline font-medium">View History</Link>
          </div>
          
          <div className="divide-y divide-gray-50 flex-1 overflow-y-auto max-h-[500px]">
            {notifications.length === 0 ? (
              <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center h-full">
                <CheckCircle size={48} className="mb-4 text-green-500 opacity-20" />
                <p>No pending alerts.</p>
                <p className="text-sm">You are completely up to date!</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div key={notif._id} className="p-5 hover:bg-blue-50/30 transition flex flex-col md:flex-row gap-4">
                  
                  {/* ICON INDICATOR */}
                  <div className={`p-3 rounded-full flex-shrink-0 self-start ${getUrgencyColor(notif.daysRemaining)}`}>
                    <AlertCircle size={20} />
                  </div>

                  {/* MESSAGE CONTENT */}
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800 leading-snug">{notif.message}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                       <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">{notif.propertyTitle}</span>
                       <span>•</span>
                       <span>{new Date(notif.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* ACTION BUTTON */}
                  {notif.tenantPhone ? (
                    <a 
                      href={getWhatsAppLink(notif)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition transform hover:scale-105 active:scale-95 whitespace-nowrap self-start md:self-center w-full md:w-auto"
                    >
                      <MessageCircle size={16} />
                      Open WhatsApp
                    </a>
                  ) : (
                     <span className="text-xs text-gray-400 self-center italic">No Phone #</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* QUICK ACTIONS PANEL (1/3 Width) */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 h-fit">
          <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Quick Actions</h3>
          <div className="space-y-3">
            <Link to="/new-agreement" className="w-full bg-enikin-red text-white p-4 rounded-lg text-sm font-bold transition flex items-center gap-3 hover:bg-red-700 shadow-md shadow-red-100">
              <Briefcase size={18}/> Create New Agreement
            </Link>
            
            <Link to="/apartments" className="w-full bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 p-3 rounded-lg text-sm font-medium transition flex items-center gap-3 text-gray-700">
              <Home size={18} className="text-gray-400"/> Add New Unit
            </Link>
            
            <Link to="/tenants" className="w-full bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 p-3 rounded-lg text-sm font-medium transition flex items-center gap-3 text-gray-700">
              <Users size={18} className="text-gray-400"/> Register Tenant
            </Link>

            <Link to="/properties" className="w-full bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 p-3 rounded-lg text-sm font-medium transition flex items-center gap-3 text-gray-700">
              <Building size={18} className="text-gray-400"/> Add Building
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;