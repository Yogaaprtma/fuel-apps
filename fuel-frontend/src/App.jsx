import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';

import AppLayout from './components/AppLayout';
import LoginPage from './pages/LoginPage';

import DashboardPage    from './pages/DashboardPage';
import DeliveriesPage   from './pages/DeliveriesPage';
import DeliveryCreate   from './pages/DeliveryCreate';
import DeliveryDetail   from './pages/DeliveryDetail';
import InvoicePage      from './pages/InvoicePage';
import TrackingPage     from './pages/TrackingPage';
import DriverPage       from './pages/DriverPage';
import CustomerTrackPage from './pages/CustomerTrackPage';
import ProfilePage      from './pages/ProfilePage';
import UsersPage        from './pages/UsersPage';

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
            background: '#FFFFFF',
            color: '#0F172A',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            fontSize: '13.5px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '500',
            boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
            padding: '12px 16px',
          },
          success: {
            iconTheme: { primary: '#10B981', secondary: '#FFFFFF' },
            style: {
              border: '1px solid #A7F3D0',
              background: '#FFFFFF',
            },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#FFFFFF' },
            style: {
              border: '1px solid #FECACA',
              background: '#FFFFFF',
            },
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/track" element={<CustomerTrackPage />} />
        <Route element={<AuthGuard><AppLayout /></AuthGuard>}>
          <Route index element={<DashboardPage />} />
          <Route path="/deliveries"            element={<DeliveriesPage />} />
          <Route path="/deliveries/new"         element={<DeliveryCreate />} />
          <Route path="/deliveries/:id"         element={<DeliveryDetail />} />
          <Route path="/deliveries/:id/invoice" element={<InvoicePage />} />
          <Route path="/tracking"               element={<TrackingPage />} />
          <Route path="/driver"                 element={<DriverPage />} />
          <Route path="/users"                  element={<UsersPage />} />
          <Route path="/profile"                element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}