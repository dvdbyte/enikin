import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Download, MoreVertical, Trash2 } from 'lucide-react';
import API from '../api';
import { AuthContext } from '../context/AuthContext';
import jsPDF from 'jspdf';

const Leases = () => {
  const { user } = useContext(AuthContext);
  const [leases, setLeases] = useState([]);
  const [filteredLeases, setFilteredLeases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Active'); 
  
  // State to track which row's menu is open
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    if (user) fetchLeases();
  }, [user]);

  // Close menu when clicking anywhere else
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    let results = leases;
    results = activeTab === 'Active' ? results.filter(l => l.status === 'Active') : results.filter(l => l.status !== 'Active');
    
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      results = results.filter(l => 
        l.tenantId?.name.toLowerCase().includes(lower) || 
        // SEARCH FIX: Look inside apartment -> property -> title
        l.apartmentId?.propertyId?.title.toLowerCase().includes(lower) ||
        l.apartmentId?.unitNumber.toLowerCase().includes(lower)
      );
    }
    setFilteredLeases(results);
  }, [searchTerm, activeTab, leases]);

  const fetchLeases = async () => {
    try {
      const res = await API.get(`/leases?agentId=${user._id}`);
      setLeases(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const terminateLease = async (id) => {
    if (window.confirm("Are you sure? The apartment will become Vacant.")) {
      try {
        await API.put(`/leases/${id}/terminate`);
        fetchLeases(); 
      } catch (err) {
        alert("Failed to terminate");
      }
    }
  };

 // 1. ADD THIS FUNCTION INSIDE THE COMPONENT (Before return)

  const generateReceipt = (lease) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // --- HEADER ---
    doc.setFillColor(200, 30, 30); // Enikin Red
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("RENT RECEIPT", pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Official Payment Confirmation", pageWidth / 2, 28, { align: 'center' });

    // --- DETAILS SECTION ---
    doc.setTextColor(0, 0, 0);
    let y = 60;
    
    // Left Side: Tenant
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("RECEIVED FROM:", 20, y);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text(lease.tenantId?.name?.toUpperCase() || "TENANT", 20, y + 7);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Phone: ${lease.tenantId?.phone || "N/A"}`, 20, y + 14);

    // Right Side: Property
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("PAYMENT FOR:", 120, y);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    // Use SAFE name field
    doc.text(lease.apartmentId?.name?.toUpperCase() || "UNIT", 120, y + 7);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(lease.apartmentId?.propertyId?.title || "", 120, y + 14);
    doc.text(lease.apartmentId?.propertyId?.address || "", 120, y + 20);

    // --- PAYMENT TABLE ---
    y += 40;
    
    // Table Header
    doc.setFillColor(240, 240, 240);
    doc.rect(20, y, pageWidth - 40, 10, 'F');
    doc.setFont("helvetica", "bold");
    doc.text("DESCRIPTION", 30, y + 7);
    doc.text("AMOUNT (NGN)", pageWidth - 30, y + 7, { align: 'right' });
    
    y += 10;
    
    // Helper to draw row
    const drawRow = (label, amount) => {
      y += 10;
      doc.setFont("helvetica", "normal");
      doc.text(label, 30, y);
      doc.text(`N${amount.toLocaleString()}`, pageWidth - 30, y, { align: 'right' });
      doc.setDrawColor(230, 230, 230);
      doc.line(20, y + 4, pageWidth - 20, y + 4);
    };

    drawRow("Base Rent", lease.rentAmount || 0);
    drawRow("Agency Fee", lease.agencyFee || 0);
    drawRow("Legal Fee", lease.legalFee || 0);
    if (lease.cautionFee > 0) drawRow("Caution Fee", lease.cautionFee);

    // --- TOTAL ---
    y += 15;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 100, 0); // Green
    doc.text("TOTAL PAID:", 120, y);
    doc.text(`N${(lease.totalPackage || 0).toLocaleString()}`, pageWidth - 30, y, { align: 'right' });

    // --- FOOTER ---
    y += 40;
    doc.setDrawColor(0, 0, 0);
    doc.line(20, y, 80, y); // Signature Line
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("Manager / Agent Signature", 20, y + 5);

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Date Issued: ${new Date().toLocaleDateString()}`, 20, y + 20);
    doc.text("Generated by Enikin Property Manager", 20, y + 25);

    doc.save(`Receipt_${lease.tenantId?.name}_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const isOverdue = (endDate) => new Date(endDate) < new Date();

  return (
    <div className="p-8">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div><h1 className="text-2xl font-bold text-gray-800">Rent Agreements</h1></div>
        <Link to="/new-agreement" className="bg-enikin-red text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition"><Plus size={20} /> New Agreement</Link>
      </div>

      {/* SEARCH & TABS */}
      <div className="bg-white p-2 rounded-xl border border-gray-100 mb-6 flex justify-between items-center gap-4">
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button onClick={() => setActiveTab('Active')} className={`px-6 py-2 rounded-md text-sm font-medium transition ${activeTab === 'Active' ? 'bg-white text-enikin-red shadow' : 'text-gray-500'}`}>Active</button>
          <button onClick={() => setActiveTab('History')} className={`px-6 py-2 rounded-md text-sm font-medium transition ${activeTab === 'History' ? 'bg-white text-gray-800 shadow' : 'text-gray-500'}`}>History</button>
        </div>
        <div className="relative w-80"><Search className="absolute left-3 top-2.5 text-gray-400" size={18} /><input type="text" placeholder="Search tenant or property..." className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-enikin-red" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 pb-32">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase"><tr><th className="p-4">Tenant</th><th className="p-4">Unit / Property</th><th className="p-4">Duration</th><th className="p-4">Status</th><th className="p-4">Actions</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {filteredLeases.map((lease) => {
              const overdue = isOverdue(lease.endDate) && lease.status === 'Active';
              
              // SAFE ACCESS TO NESTED DATA
              const buildingName = lease.apartmentId?.propertyId?.title || "Unknown Building";
              const unitName = lease.apartmentId?.name || "Unknown Unit";
              const fullAddress = lease.apartmentId?.propertyId?.address || "";

              return (
                <tr key={lease._id} className="hover:bg-gray-50 transition">
                  <td className="p-4"><div className="font-bold text-gray-800">{lease.tenantId?.name}</div></td>
                  
                  <td className="p-4">
                    <div className="font-bold text-gray-800">{unitName}</div>
                    <div className="text-xs text-gray-500">{buildingName}</div>
                    <div className="text-xs text-gray-400 truncate max-w-[200px]">{fullAddress}</div>
                  </td>
                  
                  <td className="p-4 text-sm text-gray-600">{formatDate(lease.startDate)} → {formatDate(lease.endDate)}</td>
                  
                  <td className="p-4">
                    {overdue ? <span className="text-red-600 font-bold text-xs bg-red-100 px-2 py-1 rounded">Overdue</span> 
                    : <span className={`text-xs px-2 py-1 rounded font-bold ${lease.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{lease.status}</span>}
                  </td>
                  
                  {/* SAFE 3-DOT MENU */}
                  <td className="p-4 relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === lease._id ? null : lease._id);
                      }} 
                      className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition"
                    >
                      <MoreVertical size={18}/>
                    </button>

                    {openMenuId === lease._id && (
                      <div className="absolute right-10 top-2 w-48 bg-white border border-gray-200 shadow-xl rounded-lg z-50 overflow-hidden">
                        <button onClick={() => generateReceipt(lease)} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                          <Download size={14}/> Download Receipt
                        </button>
                        {lease.status === 'Active' && (
                          <button onClick={() => terminateLease(lease._id)} className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100">
                            <Trash2 size={14}/> End Lease
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default Leases;