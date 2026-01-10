import React, { useState, useEffect, useContext } from 'react';
import { Plus, Search, Home, MapPin, Edit2, Building } from 'lucide-react';
import API from '../api';
import { AuthContext } from '../context/AuthContext';

const Apartments = () => {
  const { user } = useContext(AuthContext);
  const [apartments, setApartments] = useState([]);
  const [properties, setProperties] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All'); 
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);

  // SIMPLIFIED STATE: No unitNumber, No type. Just 'name'.
  const [formData, setFormData] = useState({
    name: '', // e.g. "Flat 1" or "2 Bedroom (A)"
    propertyId: '', 
    rentPrice: '', agencyFee: '', legalFee: '', cautionFee: ''
  });

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [aptRes, propRes] = await Promise.all([
        API.get(`/apartments?agentId=${user._id}`),
        API.get(`/properties?agentId=${user._id}`)
      ]);
      setApartments(aptRes.data);
      setProperties(propRes.data);
    } catch (err) { console.error(err); }
  };

  // --- FIX IS HERE ---
  const filteredApartments = apartments.filter(a => {
    // 1. SAFELY GET VALUES (If 'name' is missing, use empty string)
    const unitName = a.name || ""; 
    // Fallback for old data if you want to be able to search them too:
    // const unitName = a.name || a.unitNumber || ""; 
    
    const propertyTitle = a.propertyId?.title || "";
    
    const matchesSearch = unitName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          propertyTitle.toLowerCase().includes(searchTerm.toLowerCase());
                          
    const matchesStatus = filterStatus === 'All' || a.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleEdit = (apt) => {
    setEditId(apt._id);
    setFormData({
      // Load name, or fallback to old unitNumber so you don't lose data when editing
      name: apt.name || apt.unitNumber || '', 
      propertyId: apt.propertyId?._id || '',
      rentPrice: apt.rentPrice, agencyFee: apt.agencyFee, legalFee: apt.legalFee, cautionFee: apt.cautionFee
    });
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditId(null);
    setFormData({ name: '', propertyId: '', rentPrice: '', agencyFee: '', legalFee: '', cautionFee: '' });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) await API.put(`/apartments/${editId}`, formData);
      else await API.post('/apartments', { ...formData, agentId: user._id });
      setShowForm(false);
      fetchData();
      handleAddNew();
    } catch (err) { alert('Operation failed'); } 
    finally { setLoading(false); }
  };

  return (
    <div className="p-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div><h1 className="text-2xl font-bold text-gray-800">Apartments / Units</h1><p className="text-gray-500">Manage your individual units.</p></div>
        <button onClick={handleAddNew} className="bg-enikin-red text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition shadow-sm"><Plus size={20} /> Add Unit</button>
      </div>

      {/* CONTROLS */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center mb-6 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex bg-gray-100 p-1 rounded-lg w-full lg:w-auto">
          {['All', 'Vacant', 'Occupied'].map(status => (
            <button key={status} onClick={() => setFilterStatus(status)} className={`px-4 py-2 rounded-md text-sm font-medium transition flex-1 lg:flex-none ${filterStatus === status ? 'bg-white text-gray-800 shadow' : 'text-gray-500 hover:text-gray-700'}`}>{status}</button>
          ))}
        </div>
        <div className="relative w-full lg:w-96"><Search className="absolute left-3 top-2.5 text-gray-400" size={18} /><input type="text" placeholder="Search units..." className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-enikin-red bg-gray-50 focus:bg-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/></div>
      </div>

      {/* LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredApartments.map((apt) => (
          <div key={apt._id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative group hover:shadow-md transition">
            <button onClick={() => handleEdit(apt)} className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 bg-white rounded-full p-1 shadow-sm border border-gray-100"><Edit2 size={16} /></button>

            {/* SINGLE BOLD IDENTIFIER (SAFE RENDER) */}
            <div className="mb-4">
                {/* Visual Fallback: If name is missing, try showing unitNumber, or "Unnamed" */}
                <h3 className="text-2xl font-extrabold text-gray-800 tracking-tight">
                  {apt.name || apt.unitNumber || <span className="text-red-400 italic">Unnamed Unit</span>}
                </h3>
                <p className="text-xs text-gray-400 mt-1 uppercase font-bold">Unit Description</p>
            </div>

            <div className="flex items-start gap-2 mb-4 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
              <MapPin size={16} className="text-blue-500 mt-0.5 flex-shrink-0"/>
              <div>
                <p className="text-sm font-bold text-gray-800">{apt.propertyId?.title || "Unknown Building"}</p>
                <p className="text-xs text-gray-500">{apt.propertyId?.address}</p>
              </div>
            </div>

            <div className="mb-4">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${apt.status === 'Vacant' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{apt.status === 'Vacant' ? 'Available' : 'Occupied'}</span>
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between text-sm font-bold text-gray-800">
              <span>Total Package:</span> 
              <span>₦{(apt.rentPrice + apt.agencyFee + apt.legalFee + apt.cautionFee || 0).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editId ? 'Edit Unit' : 'Add New Unit'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* SINGLE INPUT FIELD */}
              <div>
                <label className="text-xs text-gray-500 font-bold mb-1 block">Unit Description / Name</label>
                <input 
                  name="name" 
                  value={formData.name} 
                  placeholder="e.g. Flat 1, Shop B, or 2 Bedroom (Top Floor)" 
                  onChange={handleInputChange} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-enikin-red focus:outline-none" 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Parent Building</label>
                <select name="propertyId" value={formData.propertyId} onChange={handleInputChange} className="w-full p-2 border rounded bg-white" required>
                  <option value="">-- Select Compound --</option>
                  {properties.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
                </select>
              </div>

              <hr className="border-gray-100"/>
              <p className="font-bold text-gray-800 text-sm">Financial Breakdown (₦)</p>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-gray-500">Base Rent</label><input name="rentPrice" type="number" value={formData.rentPrice} onChange={handleInputChange} className="w-full p-2 border rounded" required /></div>
                <div><label className="text-xs text-gray-500">Agency Fee</label><input name="agencyFee" type="number" value={formData.agencyFee} onChange={handleInputChange} className="w-full p-2 border rounded" required /></div>
                <div><label className="text-xs text-gray-500">Legal Fee</label><input name="legalFee" type="number" value={formData.legalFee} onChange={handleInputChange} className="w-full p-2 border rounded" required /></div>
                <div><label className="text-xs text-gray-500">Caution Fee</label><input name="cautionFee" type="number" value={formData.cautionFee} onChange={handleInputChange} className="w-full p-2 border rounded" required /></div>
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-enikin-red text-white rounded hover:bg-red-700">{loading ? 'Saving...' : 'Save Unit'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Apartments;