import React, { useState, useEffect, useContext } from 'react';
import { Plus, Phone, CreditCard, Edit2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../api';
import { AuthContext } from '../context/AuthContext';

const Landlords = () => {
  const { user } = useContext(AuthContext);
  const [landlords, setLandlords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', bankName: '', accountNumber: ''
  });

  useEffect(() => {
    if (user) fetchLandlords();
  }, [user]);

  const fetchLandlords = async () => {
    try {
      const res = await API.get(`/landlords?agentId=${user._id}`);
      setLandlords(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (landlord) => {
    setEditId(landlord._id);
    setFormData({
      name: landlord.name,
      phone: landlord.phone,
      email: landlord.email || '',
      bankName: landlord.bankName || '',
      accountNumber: landlord.accountNumber || ''
    });
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditId(null);
    setFormData({ name: '', phone: '', email: '', bankName: '', accountNumber: '' });
    setShowForm(true);
  };

  // ✅ Optimized handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        // Update existing landlord
        const res = await API.put(`/landlords/${editId}`, formData);
        const updatedLandlord = res.data;
        setLandlords(landlords.map(l => l._id === editId ? updatedLandlord : l));
      } else {
        // Add new landlord
        const res = await API.post('/landlords', { ...formData, agentId: user._id });
        const newLandlord = res.data;
        setLandlords([newLandlord, ...landlords]); // prepend new landlord
      }

      setShowForm(false);
      handleAddNew(); // reset form
    } catch (err) {
      console.error(err);
      alert("Failed to save landlord");
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Landlords</h1>
        <button
          onClick={handleAddNew}
          className="bg-enikin-red text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} /> Add Landlord
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {landlords.map((landlord) => (
          <div key={landlord._id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative group">
            <button
              onClick={() => handleEdit(landlord)}
              className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 bg-white rounded-full p-1 shadow-sm border border-gray-100"
            >
              <Edit2 size={16} />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                {landlord.name[0]}
              </div>
              <div>
                <h3 className="font-bold text-gray-800">{landlord.name}</h3>
                <p className="text-xs text-gray-500">Owner</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-gray-400"/> {landlord.phone}
              </div>
              <div className="flex items-center gap-2">
                <CreditCard size={16} className="text-gray-400"/> {landlord.bankName} - {landlord.accountNumber}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
              <Link to={`/properties?landlordId=${landlord._id}`} className="text-sm font-bold text-enikin-red hover:underline flex items-center gap-1">
                View Portfolio <ArrowRight size={14}/>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">{editId ? 'Edit Landlord' : 'Add Landlord'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input name="name" value={formData.name} placeholder="Full Name" className="w-full p-2 border rounded" onChange={handleInputChange} required/>
              <input name="phone" value={formData.phone} placeholder="Phone Number" className="w-full p-2 border rounded" onChange={handleInputChange} required/>
              <input name="email" value={formData.email} placeholder="Email" className="w-full p-2 border rounded" onChange={handleInputChange}/>
              <div className="grid grid-cols-2 gap-2">
                <input name="bankName" value={formData.bankName} placeholder="Bank Name" className="w-full p-2 border rounded" onChange={handleInputChange}/>
                <input name="accountNumber" value={formData.accountNumber} placeholder="Account Number" className="w-full p-2 border rounded" onChange={handleInputChange}/>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                 <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                 <button className="px-4 py-2 bg-enikin-red text-white rounded hover:bg-red-700">{editId ? 'Update' : 'Save Landlord'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landlords;
