import React, { useState, useEffect, useContext } from 'react';
import { Plus, Search, User, Phone, MapPin, Mail, LayoutGrid, List, Edit2 } from 'lucide-react';
import API from '../api';
import { AuthContext } from '../context/AuthContext';

const Tenants = () => {
  const { user } = useContext(AuthContext);
  const [tenants, setTenants] = useState([]);
  const [filteredTenants, setFilteredTenants] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // NEW: Track Edit Mode
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', address: '', passport: null
  });

  useEffect(() => {
    if (user) fetchTenants();
  }, [user]);

  useEffect(() => {
    const results = tenants.filter(tenant => 
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.phone.includes(searchTerm) ||
      tenant.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTenants(results);
  }, [searchTerm, tenants]);

  const fetchTenants = async () => {
    try {
      const res = await API.get(`/tenants?agentId=${user._id}`);
      setTenants(res.data);
      setFilteredTenants(res.data);
    } catch (err) {
      console.error("Error fetching tenants:", err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, passport: e.target.files[0] });
  };

  // NEW: Open Edit Form
  const handleEdit = (tenant) => {
    setEditId(tenant._id);
    setFormData({
      name: tenant.name,
      phone: tenant.phone,
      email: tenant.email || '',
      address: tenant.address || '',
      passport: null // Reset file input (only upload if changing)
    });
    setShowForm(true);
  };

  // NEW: Reset Form
  const handleAddNew = () => {
    setEditId(null);
    setFormData({ name: '', phone: '', email: '', address: '', passport: null });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const data = new FormData();
    data.append('name', formData.name);
    data.append('phone', formData.phone);
    data.append('email', formData.email);
    data.append('address', formData.address);
    if (formData.passport) {
      data.append('passport', formData.passport);
    }
    
    try {
      if (editId) {
        // UPDATE (PUT)
        await API.put(`/tenants/${editId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        // CREATE (POST) - Add Agent ID
        data.append('agentId', user._id);
        await API.post('/tenants', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setShowForm(false);
      fetchTenants();
      handleAddNew();
    } catch (err) {
      alert('Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div><h1 className="text-2xl font-bold text-gray-800">Tenants</h1><p className="text-gray-500">Manage your tenants and their details.</p></div>
        <button onClick={handleAddNew} className="bg-enikin-red text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition shadow-sm">
          <Plus size={20} /> Add Tenant
        </button>
      </div>

      {/* CONTROLS */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96"><Search className="absolute left-3 top-3 text-gray-400" size={20} /><input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-enikin-red bg-gray-50 focus:bg-white transition" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow text-enikin-red' : 'text-gray-500 hover:text-gray-700'}`}><LayoutGrid size={20} /></button>
          <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow text-enikin-red' : 'text-gray-500 hover:text-gray-700'}`}><List size={20} /></button>
        </div>
      </div>

      {/* CONTENT */}
      {filteredTenants.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200"><User size={48} className="mx-auto mb-3 opacity-20" /><p>No tenants found.</p></div>
      ) : (
        viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTenants.map((tenant) => (
                <div key={tenant._id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition group relative">
                  <button onClick={() => handleEdit(tenant)} className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 bg-white rounded-full p-1 shadow-sm border border-gray-100"><Edit2 size={16} /></button>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                      {tenant.passportUrl ? <img src={tenant.passportUrl} alt={tenant.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400"><User size={32} /></div>}
                    </div>
                    <div><h3 className="font-bold text-lg text-gray-800 group-hover:text-enikin-red transition">{tenant.name}</h3><span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Active</span></div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2"><Phone size={16} className="text-gray-400" />{tenant.phone}</div>
                    {tenant.email && <div className="flex items-center gap-2"><Mail size={16} className="text-gray-400" />{tenant.email}</div>}
                    {tenant.address && <div className="flex items-center gap-2"><MapPin size={16} className="text-gray-400" />{tenant.address}</div>}
                  </div>
                </div>
              ))}
            </div>
        ) : (
             <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm"><tr><th className="p-4">Name</th><th className="p-4">Phone</th><th className="p-4">Email</th><th className="p-4">Address</th><th className="p-4">Edit</th></tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTenants.map((tenant) => (
                    <tr key={tenant._id} className="hover:bg-gray-50">
                      <td className="p-4 flex items-center gap-3 font-medium text-gray-800"><div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100">{tenant.passportUrl ? <img src={tenant.passportUrl} className="w-full h-full object-cover" /> : <User size={20} className="m-1.5 text-gray-400"/>}</div>{tenant.name}</td>
                      <td className="p-4 text-gray-600">{tenant.phone}</td><td className="p-4 text-gray-600">{tenant.email || '-'}</td><td className="p-4 text-gray-600">{tenant.address || '-'}</td>
                      <td className="p-4"><button onClick={() => handleEdit(tenant)} className="text-gray-400 hover:text-blue-600"><Edit2 size={16}/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        )
      )}

      {/* MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">{editId ? 'Edit Tenant' : 'Add New Tenant'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input name="name" value={formData.name} placeholder="Full Name" onChange={handleInputChange} className="w-full p-2 border rounded" required />
              <input name="phone" value={formData.phone} placeholder="Phone Number" onChange={handleInputChange} className="w-full p-2 border rounded" required />
              <input name="email" value={formData.email} placeholder="Email (Optional)" onChange={handleInputChange} className="w-full p-2 border rounded" />
              <input name="address" value={formData.address} placeholder="Permanent Address" onChange={handleInputChange} className="w-full p-2 border rounded" />
              <div><label className="block text-sm text-gray-600 mb-1">{editId ? 'Update Photo (Optional)' : 'Passport Photo'}</label><input type="file" onChange={handleFileChange} className="w-full text-sm text-gray-500" accept="image/*" /></div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-enikin-red text-white rounded hover:bg-red-700">{loading ? 'Saving...' : (editId ? 'Update' : 'Save Tenant')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tenants;