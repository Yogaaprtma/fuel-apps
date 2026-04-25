import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import useDeliveryStore from '../store/deliveryStore';

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';

const STATUS_LABELS = {
  CREATED: 'Dibuat', PACKED: 'Dikemas', IN_TRANSIT: 'Dalam Perjalanan',
  NEAR_DESTINATION: 'Mendekati Tujuan', DELIVERED: 'Terkirim', COMPLETED: 'Selesai',
};

export default function InvoicePage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { current, fetchDelivery } = useDeliveryStore();

  useEffect(() => { fetchDelivery(id); }, [id]);

  if (!current) return (
    <div className="flex h-64 items-center justify-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      <p className="text-sm text-slate-400">Memuat data invoice...</p>
    </div>
  );

  const handlePrint = () => window.print();
  const formatRp    = (n) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`;
  const formatDate  = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  return (
    <>
      {/* Print controls — hidden on print */}
      <div className="no-print flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="btn-ghost p-2" id="back-btn">
          <ArrowLeft size={19} />
        </button>
        <h1 className="page-title flex-1">Invoice Pengiriman</h1>
        <button onClick={handlePrint} className="btn-primary flex items-center gap-2" id="print-btn">
          <Printer size={16} /> Cetak Invoice
        </button>
      </div>

      {/* Invoice Document */}
      <div id="invoice-doc" style={{
        maxWidth: 720, margin: '0 auto', background: '#fff',
        border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563EB 100%)', padding: '32px 40px', color: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⛽</div>
                <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.5px' }}>FuelDS</span>
              </div>
              <p style={{ opacity: 0.7, fontSize: 13 }}>Fuel Delivery System</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontWeight: 700, fontSize: 22, fontFamily: 'monospace' }}>{current.delivery_code}</p>
              <span style={{
                display: 'inline-block', marginTop: 6, padding: '3px 12px',
                borderRadius: 20, background: 'rgba(255,255,255,0.2)',
                fontSize: 11, fontWeight: 600,
              }}>
                {STATUS_LABELS[current.status] || current.status}
              </span>
            </div>
          </div>
        </div>

        <div style={{ padding: '32px 40px' }}>
          {/* Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 32 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94A3B8', marginBottom: 12 }}>Info Pelanggan</p>
              <InfoItem label="Nama" value={current.customer_name} />
              <InfoItem label="Telepon" value={current.customer_phone} />
              <InfoItem label="Alamat Tujuan" value={current.destination_address} />
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94A3B8', marginBottom: 12 }}>Info Pengiriman</p>
              <InfoItem label="Driver" value={current.driver?.name} />
              <InfoItem label="Admin" value={current.admin?.name} />
              <InfoItem label="Tanggal Dibuat" value={formatDate(current.created_at)} />
              {current.proof?.signed_at && <InfoItem label="Tanggal Terima" value={formatDate(current.proof.signed_at)} />}
            </div>
          </div>

          {/* Detail BBM */}
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94A3B8', marginBottom: 12 }}>Detail Bahan Bakar</p>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  {['Jenis BBM', 'Volume', 'Harga/Liter', 'Total'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B', border: '1px solid #E2E8F0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, border: '1px solid #E2E8F0' }}>{current.fuel_type?.replace(/_/g, ' ')}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, fontFamily: 'monospace', border: '1px solid #E2E8F0' }}>{current.volume_liters} L</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, fontFamily: 'monospace', border: '1px solid #E2E8F0' }}>{formatRp(current.price_per_liter)}</td>
                  <td style={{ padding: '12px 14px', fontSize: 14, fontWeight: 700, color: '#2563EB', fontFamily: 'monospace', border: '1px solid #E2E8F0' }}>{formatRp(current.total_price)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 32 }}>
            <div style={{ background: '#EFF6FF', borderRadius: 12, padding: '16px 24px', textAlign: 'right' }}>
              <p style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>Total Pembayaran</p>
              <p style={{ fontSize: 28, fontWeight: 800, color: '#2563EB', fontFamily: 'monospace' }}>{formatRp(current.total_price)}</p>
            </div>
          </div>

          {/* POD Info */}
          {current.proof && (
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: '16px 20px', marginBottom: 32, display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#059669', marginBottom: 8 }}>✅ Bukti Pengiriman Diterima</p>
                <InfoItem label="Penerima" value={current.proof.recipient_name} />
                <InfoItem label="Geofence" value={current.proof.geofence_valid ? '✓ Valid' : '✗ Invalid'} />
              </div>
              {current.proof.signature_path && (
                <div>
                  <p style={{ fontSize: 11, color: '#64748B', marginBottom: 6 }}>Tanda Tangan</p>
                  <img
                    src={`${BASE_URL}/storage/${current.proof.signature_path}`}
                    alt="Tanda tangan"
                    style={{ height: 64, border: '1px solid #E2E8F0', borderRadius: 8, background: '#fff' }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {current.notes && (
            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 20, marginBottom: 24 }}>
              <p style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600, marginBottom: 6 }}>CATATAN</p>
              <p style={{ fontSize: 13, color: '#64748B', fontStyle: 'italic' }}>{current.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 11, color: '#94A3B8' }}>Dicetak: {new Date().toLocaleString('id-ID')}</p>
            <p style={{ fontSize: 11, color: '#94A3B8' }}>FuelDS — Fuel Delivery System</p>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #invoice-doc, #invoice-doc * { visibility: visible; }
          #invoice-doc { position: absolute; left: 0; top: 0; width: 100%; border: none !important; border-radius: 0 !important; }
          .no-print { display: none !important; }
        }
      `}</style>
    </>
  );
}

function InfoItem({ label, value }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <p style={{ fontSize: 11, color: '#94A3B8', marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: 13, fontWeight: 500, color: '#0F172A' }}>{value || '—'}</p>
    </div>
  );
}
