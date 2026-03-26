import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';

import AppLayout from './components/AppLayout';
import LoginPage from './pages/LoginPage';

const DeliveryDetail = () => <div className="text-white text-2xl font-bold glass p-6 rounded-2xl">🚧 Halaman Detail Delivery (Belum Dibuat)</div>;
const TrackingPage = () => <div className="text-white text-2xl font-bold glass p-6 rounded-2xl">🚧 Halaman Tracking (Belum Dibuat)</div>;
const DriverPage = () => <div className="text-white text-2xl font-bold glass p-6 rounded-2xl">🚧 Halaman Driver (Belum Dibuat)</div>;
const CustomerTrackPage = () => <div className="text-white text-2xl font-bold glass p-6 rounded-2xl">🚧 Halaman Customer Track (Belum Dibuat)</div>;
const ProfilePage = () => <div className="text-white text-2xl font-bold glass p-6 rounded-2xl">🚧 Halaman Profil (Belum Dibuat)</div>;
const UsersPage = () => <div className="text-white text-2xl font-bold glass p-6 rounded-2xl">🚧 Halaman Users (Belum Dibuat)</div>;

import DashboardPage from './pages/DashboardPage';
import DeliveriesPage from './pages/DeliveriesPage';
import DeliveryCreate from './pages/DeliveryCreate';
// import DeliveryDetail from './pages/DeliveryDetail';
// import TrackingPage from './pages/TrackingPage';
// import DriverPage from './pages/DriverPage';
// import CustomerTrackPage from './pages/CustomerTrackPage';
// import ProfilePage from './pages/ProfilePage';
// import UsersPage from './pages/UsersPage';

function AuthGuard({ children }) {
  const token = useAuthStore(s => s.token);
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid rgba(255,107,53,0.3)',
            borderRadius: '12px',
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/track" element={<CustomerTrackPage />} />
        <Route element={<AuthGuard><AppLayout /></AuthGuard>}>
          <Route index element={<DashboardPage />} />
          <Route path="/deliveries" element={<DeliveriesPage />} />
          <Route path="/deliveries/new" element={<DeliveryCreate />} />
          <Route path="/deliveries/:id" element={<DeliveryDetail />} />
          <Route path="/tracking" element={<TrackingPage />} />
          <Route path="/driver" element={<DriverPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}