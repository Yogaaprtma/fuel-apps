import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, MapPin } from 'lucide-react';
import useDeliveryStore from '../store/deliveryStore';
import { userApi } from '../services/api';
import toast from 'react-hot-toast';

const FUEL_TYPES = ['PERTALITE','PERTAMAX','PERTAMAX_TURBO','SOLAR','DEXLITE'];
const FUEL_PRICES = { PERTALITE: 10000, PERTAMAX: 13500, PERTAMAX_TURBO: 15000, SOLAR: 6800, DEXLITE: 15800 };

export default function DeliveryCreate() {
  const navigate = useNavigate();
  const { createDelivery } = useDeliveryStore();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    driver_id: '', customer_name: '', customer_phone: '',
    destination_address: '', destination_lat: '', destination_lng: '',
    geofence_radius: 200, fuel_type: 'PERTALITE',
    volume_liters: '', price_per_liter: FUEL_PRICES.PERTALITE, notes: '',
  });

  useEffect(() => {
    userApi.drivers().then(r => setDrivers(r.data));
  }, []);

  const total = (form.volume_liters || 0) * (form.price_per_liter || 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'fuel_type' ? { price_per_liter: FUEL_PRICES[value] } : {}),
    }));
  };

  const getGPS = () => {
    navigator.geolocation.getCurrentPosition(
      pos => setForm(prev => ({
        ...prev,
        destination_lat: pos.coords.latitude.toFixed(7),
        destination_lng: pos.coords.longitude.toFixed(7),
      })),
      () => toast.error('Gagal mendapatkan lokasi GPS')
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const delivery = await createDelivery(form);
      toast.success(`Delivery ${delivery.delivery_code} berhasil dibuat!`);
      navigate(`/deliveries/${delivery.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat delivery');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, children }) => (
    <div>
      <label className="block text-sm text-slate-400 mb-1.5">{label}</label>
      {children}
    </div>
  );

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-ghost p-2">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display text-2xl font-bold text-white">Buat Delivery Baru</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Info Driver */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-white">Informasi Driver</h2>
          <Field label="Pilih Driver *">
            <select name="driver_id" className="input" value={form.driver_id} onChange={handleChange} required>
              <option value="">-- Pilih Driver --</option>
              {drivers.map(d => (
                <option key={d.id} value={d.id}>{d.name} {d.phone && `(${d.phone})`}</option>
              ))}
            </select>
          </Field>
        </div>

        {/* Info Customer */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-white">Informasi Customer</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nama Customer *">
              <input name="customer_name" className="input" value={form.customer_name} onChange={handleChange} required />
            </Field>
            <Field label="Nomor HP *">
              <input name="customer_phone" className="input" type="tel" value={form.customer_phone} onChange={handleChange} required />
            </Field>
          </div>
          <Field label="Alamat Tujuan *">
            <textarea name="destination_address" className="input resize-none" rows={3}
              value={form.destination_address} onChange={handleChange} required />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Latitude *">
              <input name="destination_lat" className="input font-mono" type="number" step="any"
                value={form.destination_lat} onChange={handleChange} required />
            </Field>
            <Field label="Longitude *">
              <input name="destination_lng" className="input font-mono" type="number" step="any"
                value={form.destination_lng} onChange={handleChange} required />
            </Field>
          </div>
          <button type="button" onClick={getGPS} className="btn-ghost text-sm">
            <MapPin size={16} className="text-flame" /> Gunakan Lokasi GPS Saat Ini
          </button>
          <Field label="Radius Geofence (meter)">
            <input name="geofence_radius" className="input" type="number" value={form.geofence_radius} onChange={handleChange} />
          </Field>
        </div>

        {/* Info BBM */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-white">Detail Bahan Bakar</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Jenis BBM *">
              <select name="fuel_type" className="input" value={form.fuel_type} onChange={handleChange}>
                {FUEL_TYPES.map(f => <option key={f} value={f}>{f.replace('_', ' ')}</option>)}
              </select>
            </Field>
            <Field label="Volume (Liter) *">
              <input name="volume_liters" className="input" type="number" step="0.01" min="1"
                value={form.volume_liters} onChange={handleChange} required />
            </Field>
            <Field label="Harga/Liter (Rp)">
              <input name="price_per_liter" className="input font-mono" type="number"
                value={form.price_per_liter} onChange={handleChange} />
            </Field>
            <Field label="Total Harga">
              <div className="input bg-slate-950 text-flame font-mono font-bold">
                Rp {total.toLocaleString('id-ID')}
              </div>
            </Field>
          </div>
          <Field label="Catatan">
            <textarea name="notes" className="input resize-none" rows={2} value={form.notes} onChange={handleChange} />
          </Field>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-ghost flex-1">Batal</button>
          <button type="submit" className="btn-primary flex-1" disabled={loading}>
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? 'Menyimpan...' : 'Buat Delivery'}
          </button>
        </div>
      </form>
    </div>
  );
}