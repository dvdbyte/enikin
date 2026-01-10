import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { AuthContext } from '../context/AuthContext';
import { Calculator, ArrowLeft, CheckCircle } from 'lucide-react';

const NewLease = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [apartments, setApartments] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    apartmentId: '',
    tenantId: '',
    startDate: '',
    durationInYears: 1,
    
    // Financials (Will be auto-filled)
    rentAmount: '',
    agencyFee: '',
    legalFee: '',
    cautionFee: ''
  });

  // Calculate Total on the fly
  const totalPackage = Number(formData.rentAmount) + Number(formData.agencyFee) + Number(formData.legalFee) + Number(formData.cautionFee);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [aptRes, tenRes] = await Promise.all([
        API.get(`/apartments?agentId=${user._id}`),
        API.get(`/tenants?agentId=${user._id}`)
      ]);
      // Only show VACANT apartments for new leases
      setApartments(aptRes.data.filter(a => a.status === 'Vacant'));
      setTenants(tenRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // AUTO-FILL LOGIC: If user selects an apartment, pull its prices
    if (name === 'apartmentId') {
      const selectedApt = apartments.find(a => a._id === value);
      if (selectedApt) {
        setFormData(prev => ({
          ...prev,
          apartmentId: value,
          rentAmount: selectedApt.rentPrice,
          agencyFee: selectedApt.agencyFee,
          legalFee: selectedApt.legalFee,
          cautionFee: selectedApt.cautionFee
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/leases', {
        ...formData,
        agentId: user._id
      });
      alert("Agreement Created Successfully!");
      navigate('/leases');
    } catch (err) {
      alert("Failed to create agreement. Check network.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-800 mb-6">
        <ArrowLeft size={18} className="mr-1"/> Back
      </button>

      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <CheckCircle className="text-enikin-red"/> Create New Agreement
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* SECTION 1: WHO & WHERE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Select Unit (Vacant Only)</label>
              <select 
                name="apartmentId" 
                value={formData.apartmentId} 
                onChange={handleChange} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-enikin-red focus:outline-none bg-white"
                required
              >
                <option value="">-- Choose Vacant Apartment --</option>
                {apartments.map(apt => (
                  <option key={apt._id} value={apt._id}>
                    {apt.name} ({apt.propertyId?.title})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Select Tenant</label>
              <select 
                name="tenantId" 
                value={formData.tenantId} 
                onChange={handleChange} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-enikin-red focus:outline-none bg-white"
                required
              >
                <option value="">-- Choose Tenant --</option>
                {tenants.map(t => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* SECTION 2: DURATION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Start Date</label>
              <input 
                type="date" 
                name="startDate" 
                value={formData.startDate} 
                onChange={handleChange} 
                className="w-full p-3 border border-gray-300 rounded-lg"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Duration (Years)</label>
              <input 
                type="number" 
                name="durationInYears" 
                value={formData.durationInYears} 
                onChange={handleChange} 
                min="1" max="10"
                className="w-full p-3 border border-gray-300 rounded-lg"
                required 
              />
            </div>
          </div>

          {/* SECTION 3: MONEY (Auto-Filled) */}
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-4 flex items-center gap-2">
              <Calculator size={16}/> Payment Breakdown (Confirm Details)
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Base Rent (₦)</label>
                <input type="number" name="rentAmount" value={formData.rentAmount} onChange={handleChange} className="w-full p-2 border rounded font-bold text-gray-700"/>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Agency (₦)</label>
                <input type="number" name="agencyFee" value={formData.agencyFee} onChange={handleChange} className="w-full p-2 border rounded text-gray-600"/>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Agreement (₦)</label>
                <input type="number" name="legalFee" value={formData.legalFee} onChange={handleChange} className="w-full p-2 border rounded text-gray-600"/>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Caution (₦)</label>
                <input type="number" name="cautionFee" value={formData.cautionFee} onChange={handleChange} className="w-full p-2 border rounded text-gray-600"/>
              </div>
            </div>

            {/* TOTAL */}
            <div className="mt-4 p-4 bg-gray-900 text-white rounded-lg flex justify-between items-center">
              <span className="text-sm font-medium opacity-80">Total Collectible from Tenant:</span>
              <span className="text-2xl font-bold">₦{totalPackage.toLocaleString()}</span>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-enikin-red text-white font-bold py-4 rounded-lg hover:bg-red-700 transition shadow-lg shadow-red-200"
          >
            {loading ? 'Generating Agreement...' : 'Generate Agreement & Save'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewLease;