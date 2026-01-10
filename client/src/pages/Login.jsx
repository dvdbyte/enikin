import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/login', { email, password });
      // Save user to context
      login(res.data);
      // Redirect to Dashboard
      navigate('/');
    } catch (err) {
      setError(true);
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96 border border-gray-100">
        <h1 className="text-3xl font-bold text-enikin-red mb-2">Enikin.</h1>
        <p className="text-gray-500 mb-6">Sign in to manage your properties.</p>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">Invalid email or password</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              type="email" 
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-enikin-red"
              placeholder="agent@example.com"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-enikin-red"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="w-full bg-enikin-red text-white py-3 rounded-lg font-bold hover:bg-red-700 transition">
            Login
          </button>
        </form>
        
        <p className="mt-4 text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-enikin-red hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;