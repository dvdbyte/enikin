import React, { useState, useContext, useEffect } from 'react';
import { Save, Bell, Play } from 'lucide-react';
import API from '../api';
import { AuthContext } from '../context/AuthContext';


const Settings = () => {
  const { user, login } = useContext(AuthContext); // We use login to update the stored user data
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    reminderString: user?.reminderSettings?.join(', ') || '90, 30, 7'
  });

  // Handle Input Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 1. Save Profile Changes
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Convert string "90, 30" back to array [90, 30]
      const settingsArray = formData.reminderString
        .split(',')
        .map(num => parseInt(num.trim()))
        .filter(n => !isNaN(n));

      const res = await API.put('/auth/profile', {
        userId: user._id, // Send ID to know who to update
        name: formData.name,
        email: formData.email,
        reminderSettings: settingsArray
      });

      login(res.data); // Update Context/LocalStorage with new data
      alert("Settings Saved!");
    } catch (err) {
      console.error(err);
      alert("Failed to save settings.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Manual Trigger for Notifications
  const runManualCheck = async () => {
    try {
      const res = await API.post('/leases/check-reminders');
      alert(res.data.message); // "Check complete. Generated X alerts."
    } catch (err) {
      alert("Error running check.");
    }
  };

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Profile Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Save size={20} className="text-enikin-red"/> Profile Settings
          </h2>
          
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Full Name</label>
              <input name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <input name="email" value={formData.email} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
            
            <div className="pt-4 border-t">
              <label className="block text-sm font-bold text-gray-700 mb-1">Reminder Rules (Days)</label>
              <p className="text-xs text-gray-500 mb-2">Separate with commas. E.g., remind me 90 days, 30 days, and 7 days before rent is due.</p>
              <input 
                name="reminderString" 
                value={formData.reminderString} 
                onChange={handleChange} 
                className="w-full p-2 border rounded bg-yellow-50" 
                placeholder="90, 60, 30, 7"
              />
            </div>

            <button disabled={loading} className="bg-enikin-red text-white px-4 py-2 rounded hover:bg-red-700 w-full">
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* System Tools Section */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Bell size={20} className="text-blue-600"/> System Tools
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              The system automatically checks for due rents every morning at 8:00 AM. 
              Use this button to force a check right now for testing.
            </p>
            <button 
              onClick={runManualCheck}
              className="flex items-center justify-center gap-2 w-full border border-blue-600 text-blue-600 px-4 py-2 rounded hover:bg-blue-50 transition"
            >
              <Play size={18} /> Run Rent Check Now
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;