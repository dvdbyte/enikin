import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContextProvider } from './context/AuthContext'; 
import ProtectedRoute from './components/ProtectedRoute';


import Layout from './components/Layout'; 

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup'; 
import Dashboard from './pages/Dashboard';
import Tenants from './pages/Tenants';
import Properties from './pages/Properties'; 
import Apartments from './pages/Apartments'; 
import NewLease from './pages/NewLease';
import Leases from './pages/Leases';
import Landlords from './pages/Landlords';
import Settings from './pages/Settings';

function App() {
  return (
    <AuthContextProvider>
      <BrowserRouter>
        <Routes>
          
          {/* PUBLIC ROUTES */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* PROTECTED ROUTES */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            
            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
            
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tenants" element={<Tenants />} />
            <Route path="/apartments" element={<Apartments />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/new-agreement" element={<NewLease />} />
            <Route path="/leases" element={<Leases />} />
            <Route path="/landlords" element={<Landlords />} />
            <Route path="/settings" element={<Settings />} />
            
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthContextProvider>
  );
}

export default App;