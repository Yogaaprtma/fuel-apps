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
import RealTimeListener from './components/RealTimeListener';

function AuthGuard({ children }) {
  const token = useAuthStore(s => s.token);
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <RealTimeListener />
      <Toaster
        position="top-center"
        gutter={8}
        toastOptions={{
          duration: 3500,
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-main)',
            border: '1px solid var(--border-main)',
            borderRadius: '12px',
            fontSize: '13.5px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '500',
            boxShadow: 'var(--shadow)',
            padding: '12px 16px',
          },
          success: {
            iconTheme: { primary: 'var(--success)', secondary: 'var(--bg-card)' },
            style: {
              border: '1px solid var(--success-light)',
            },
          },
          error: {
            iconTheme: { primary: 'var(--danger)', secondary: 'var(--bg-card)' },
            style: {
              border: '1px solid var(--danger-light)',
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