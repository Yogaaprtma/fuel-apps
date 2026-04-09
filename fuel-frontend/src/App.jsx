import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';

import AppLayout from './components/AppLayout';
import LoginPage from './pages/LoginPage';

import DashboardPage from './pages/DashboardPage';
import DeliveriesPage from './pages/DeliveriesPage';
import DeliveryCreate from './pages/DeliveryCreate';
import DeliveryDetail from './pages/DeliveryDetail';
import TrackingPage from './pages/TrackingPage';
import DriverPage from './pages/DriverPage';
import CustomerTrackPage from './pages/CustomerTrackPage';
import ProfilePage from './pages/ProfilePage';
import UsersPage from './pages/UsersPage';

function AuthGuard({ children }) {
  const token = useAuthStore(s => s.token);
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        gutter={8}
        toastOptions={{
          duration: 3500,
          style: {
            background: 'rgba(13, 20, 36, 0.95)',
            color: '#f0f4f8',
            border: '1px solid rgba(30, 45, 66, 0.9)',
            borderRadius: '14px',
            fontSize: '13px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '500',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            padding: '12px 16px',
          },
          success: {
            iconTheme: { primary: '#4ade80', secondary: 'rgba(13,20,36,1)' },
            style: {
              background: 'rgba(13, 20, 36, 0.95)',
              border: '1px solid rgba(74, 222, 128, 0.25)',
            },
          },
          error: {
            iconTheme: { primary: '#f87171', secondary: 'rgba(13,20,36,1)' },
            style: {
              background: 'rgba(13, 20, 36, 0.95)',
              border: '1px solid rgba(248, 113, 113, 0.25)',
            },
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