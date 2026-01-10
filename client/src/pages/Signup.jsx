import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    try {
      // Send data to the backend
      await API.post('/auth/register', formData);
      alert("Account Created! Please Login.");
      navigate('/login'); // Send them to login page
    } catch (err) {
      setError(true);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96 border border-gray-100">
        <h1 className="text-3xl font-bold text-enikin-red mb-2">Enikin.</h1>
        <p className="text-gray-500 mb-6">Create your agent account.</p>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">Registration failed. Try again.</div>}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              name="name"
              type="text" 
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-enikin-red"
              placeholder="John Agent"
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              name="email"
              type="email" 
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-enikin-red"
              placeholder="agent@example.com"
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              name="password"
              type="password" 
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-enikin-red"
              placeholder="••••••••"
              onChange={handleChange}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-enikin-red text-white py-3 rounded-lg font-bold hover:bg-red-700 transition disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
        
        <p className="mt-4 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-enikin-red hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;