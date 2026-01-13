import React, { useState, useEffect, useContext } from 'react';
import { Plus, Search, MapPin, Building, Edit2, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import API from '../api';
import { AuthContext } from '../context/AuthContext';

const Properties = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation(); 
  const [properties, setProperties] = useState([]);
  const [landlords, setLandlords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ title: '', address: '', landlordId: '' });

  useEffect(() => { if (user) fetchData(); }, [user]);

  const fetchData = async () => {
    try {
      const [propRes, landRes] = await Promise.all([
        API.get(`/properties?agentId=${user._id}`),
        API.get(`/landlords?agentId=${user._id}`)
      ]);
      setProperties(propRes.data);
      setLandlords(landRes.data);
    } catch (err) { console.error(err); }
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // FILTER LOGIC
  const params = new URLSearchParams(location.search);
  const activeLandlordFilter = params.get('landlordId');

  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    // If URL has landlordId, check if it matches. If not, match everything.
    const matchesLandlord = activeLandlordFilter ? p.landlordId?._id === activeLandlordFilter : true;
    
    return matchesSearch && matchesLandlord;
  });

  const handleEdit = (property) => {
    setEditId(property._id);
    setFormData({ title: property.title, address: property.address, landlordId: property.landlordId?._id || '' });
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditId(null);
    setFormData({ title: '', address: '', landlordId: '' });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) await API.put(`/properties/${editId}`, formData);
      else await API.post('/properties', { ...formData, agentId: user._id });
      setShowForm(false);
      fetchData();
      handleAddNew();
    } catch (err) { alert('Operation failed'); } 
    finally { setLoading(false); }
  };

  return (
    <div className="p-8">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Buildings / Compounds</h1>
          <p className="text-gray-500">Manage your properties.</p>
        </div>
        <button onClick={handleAddNew} className="bg-enikin-red text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition"><Plus size={20} /> Add Building</button>
      </div>

      {/* SEARCH & FILTER BANNER */}
      {activeLandlordFilter && (
        <div className="mb-6 bg-blue-50 text-blue-700 p-4 rounded-lg flex justify-between items-center border border-blue-100">
          <span className="font-medium">Filter Active: Showing buildings for selected landlord.</span>
          <Link to="/properties" className="bg-white text-blue-700 px-3 py-1 rounded-md text-sm font-bold shadow-sm hover:bg-blue-50 flex items-center gap-1">
            <X size={14}/> Clear Filter
          </Link>
        </div>
      )}

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input type="text" placeholder="Search buildings..." className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-enikin-red" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
        </div>
      </div>

      {/* LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((prop) => (
          <div key={prop._id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative group">
            <button onClick={() => handleEdit(prop)} className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 bg-white rounded-full p-1 shadow-sm border border-gray-100"><Edit2 size={16} /></button>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500"><Building size={24} /></div>
              <div><h3 className="font-bold text-gray-800">{prop.title}</h3><p className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={12}/> {prop.address}</p></div>
            </div>
            <div className="pt-4 border-t border-gray-50">
              <p className="text-xs text-gray-400 uppercase font-bold mb-1">Landlord</p>
              <p className="text-sm font-medium text-gray-700">{prop.landlordId?.name || "Unknown"}</p>
            </div>
          </div>
        ))}
      </div>

      {/* FORM MODAL*/}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">{editId ? 'Edit Building' : 'Add New Building'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input name="title" value={formData.title} placeholder="Building Name" onChange={handleInputChange} className="w-full p-2 border rounded" required />
              <input name="address" value={formData.address} placeholder="Address" onChange={handleInputChange} className="w-full p-2 border rounded" required />
              <div>
                <label className="block text-sm text-gray-600 mb-1">Owner</label>
                <select name="landlordId" value={formData.landlordId} onChange={handleInputChange} className="w-full p-2 border rounded bg-white" required>
                  <option value="">-- Select Landlord --</option>
                  {landlords.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-enikin-red text-white rounded hover:bg-red-700">{loading ? 'Saving...' : 'Save Building'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Properties;