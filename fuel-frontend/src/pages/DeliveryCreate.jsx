import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, MapPin, ChevronRight, Fuel, User, Phone, Navigation, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import useDeliveryStore from '../store/deliveryStore';
import { userApi } from '../services/api';

const FUEL_TYPES = ['PERTALITE','PERTAMAX','PERTAMAX_TURBO','SOLAR','DEXLITE'];
const FUEL_PRICES = {
  PERTALITE: 10000, PERTAMAX: 13500, PERTAMAX_TURBO: 15000,
  SOLAR: 6800, DEXLITE: 15800,
};
const FUEL_COLORS = {
  PERTALITE: '#4ade80', PERTAMAX: '#60a5fa',
  PERTAMAX_TURBO: '#a78bfa', SOLAR: '#fbbf24', DEXLITE: '#fb923c',
};
const INITIAL_FORM = {
  driver_id: '', customer_name: '', customer_phone: '',
  destination_address: '', destination_lat: '', destination_lng: '',
  geofence_radius: 200, fuel_type: 'PERTALITE',
  volume_liters: '', price_per_liter: FUEL_PRICES.PERTALITE, notes: '',
};

const STEPS = ['Driver & Customer', 'Lokasi Tujuan', 'Detail BBM'];

function Field({ label, required, children }) {
  return (
    <div>
      <label className="label">
        {label} {required && <span style={{ color: '#f97316' }}>*</span>}
      </label>
      {children}
    </div>
  );
}

export default function DeliveryCreate() {
  const navigate = useNavigate();
  const { createDelivery } = useDeliveryStore();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(INITIAL_FORM);
  const [gpsLoading, setGpsLoading] = useState(false);

  useEffect(() => {
    userApi.drivers().then(res => setDrivers(res.data));
  }, []);

  const total = (form.volume_liters || 0) * (form.price_per_liter || 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev, [name]: value,
      ...(name === 'fuel_type' ? { price_per_liter: FUEL_PRICES[value] } : {}),
    }));
  };

  const getGPS = () => {
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setForm(prev => ({
          ...prev,
          destination_lat: pos.coords.latitude.toFixed(7),
          destination_lng: pos.coords.longitude.toFixed(7),
        }));
        setGpsLoading(false);
        toast.success('Koordinat GPS berhasil diambil');
      },
      () => { toast.error('Gagal mendapatkan lokasi GPS'); setGpsLoading(false); }
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
      setLoading(false);
    }
  };

  const validateStep = (s) => {
    if (s === 0) return form.driver_id && form.customer_name && form.customer_phone;
    if (s === 1) return form.destination_address && form.destination_lat && form.destination_lng;
    return true;
  };

  const nextStep = () => {
    if (!validateStep(step)) { toast.error('Lengkapi semua field yang wajib'); return; }
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  };

  return (
    <div className="max-w-2xl animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="btn-ghost p-2" id="back-btn">
          <ArrowLeft size={19} />
        </button>
        <div>
          <h1 className="page-title">Buat Delivery Baru</h1>
          <p className="page-subtitle">Isi informasi pengiriman bahan bakar</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="card !p-4 mb-5">
        <div className="flex items-center gap-0">
          {STEPS.map((label, i) => (
            <React.Fragment key={i}>
              <button
                onClick={() => i < step && setStep(i)}
                className="flex items-center gap-2 transition-all duration-200"
                style={{ cursor: i < step ? 'pointer' : 'default' }}
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                  style={{
                    background: i <= step
                      ? 'linear-gradient(135deg, #f97316, #ea6c0a)'
                      : 'rgba(30,45,66,0.8)',
                    color: i <= step ? 'white' : '#4a6080',
                    boxShadow: i === step ? '0 0 12px rgba(249,115,22,0.4)' : undefined,
                  }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className="text-xs font-medium hidden sm:block"
                  style={{ color: i === step ? '#f97316' : i < step ? '#8fa3bd' : '#4a6080' }}>
                  {label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-px mx-2 transition-all duration-300"
                  style={{ background: i < step ? 'rgba(249,115,22,0.4)' : 'rgba(30,45,66,0.8)' }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 0: Driver & Customer */}
        {step === 0 && (
          <div className="card space-y-5 animate-slide-up">
            <div className="flex items-center gap-2 mb-1">
              <User size={16} style={{ color: '#f97316' }} />
              <h2 className="font-semibold text-text-primary">Driver & Customer</h2>
            </div>

            <Field label="Pilih Driver" required>
              <select name="driver_id" className="input" value={form.driver_id} onChange={handleChange} required id="driver-select">
                <option value="">-- Pilih Driver --</option>
                {drivers.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name}{d.phone ? ` (${d.phone})` : ''}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Nama Customer" required>
                <input name="customer_name" className="input" value={form.customer_name}
                  onChange={handleChange} required placeholder="Budi Santoso" id="customer-name" />
              </Field>
              <Field label="Nomor HP" required>
                <div className="relative">
                  <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#4a6080' }} />
                  <input name="customer_phone" className="input pl-10" type="tel"
                    value={form.customer_phone} onChange={handleChange} required
                    placeholder="08xxxxxxxxxx" id="customer-phone" />
                </div>
              </Field>
            </div>
          </div>
        )}

        {/* Step 1: Lokasi */}
        {step === 1 && (
          <div className="card space-y-5 animate-slide-up">
            <div className="flex items-center gap-2 mb-1">
              <MapPin size={16} style={{ color: '#f97316' }} />
              <h2 className="font-semibold text-text-primary">Lokasi Tujuan</h2>
            </div>

            <Field label="Alamat Tujuan" required>
              <textarea name="destination_address" className="input resize-none" rows={3}
                value={form.destination_address} onChange={handleChange} required
                placeholder="Jl. Contoh No. 123, Kelurahan, Kecamatan, Kota"
                id="destination-address" />
            </Field>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Latitude" required>
                <input name="destination_lat" className="input font-mono" type="number" step="any"
                  value={form.destination_lat} onChange={handleChange} required
                  placeholder="-6.2088" id="destination-lat" />
              </Field>
              <Field label="Longitude" required>
                <input name="destination_lng" className="input font-mono" type="number" step="any"
                  value={form.destination_lng} onChange={handleChange} required
                  placeholder="106.8456" id="destination-lng" />
              </Field>
            </div>

            <button type="button" onClick={getGPS} disabled={gpsLoading}
              className="btn-secondary text-sm" id="get-gps">
              {gpsLoading ? <Loader2 size={15} className="animate-spin" /> : <Navigation size={15} style={{ color: '#06b6d4' }} />}
              {gpsLoading ? 'Mengambil GPS...' : 'Gunakan Lokasi GPS Sekarang'}
            </button>

            <Field label="Radius Geofence (meter)">
              <input name="geofence_radius" className="input" type="number" min="50" max="2000"
                value={form.geofence_radius} onChange={handleChange} id="geofence-radius" />
              <p className="text-[11px] mt-1.5" style={{ color: '#4a6080' }}>
                Area validasi saat driver tiba. Default: 200m
              </p>
            </Field>
          </div>
        )}

        {/* Step 2: Detail BBM */}
        {step === 2 && (
          <div className="card space-y-5 animate-slide-up">
            <div className="flex items-center gap-2 mb-1">
              <Fuel size={16} style={{ color: '#f97316' }} />
              <h2 className="font-semibold text-text-primary">Detail Bahan Bakar</h2>
            </div>

            {/* Fuel type selector */}
            <Field label="Jenis BBM" required>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-1">
                {FUEL_TYPES.map(ft => (
                  <button key={ft} type="button"
                    onClick={() => setForm(p => ({ ...p, fuel_type: ft, price_per_liter: FUEL_PRICES[ft] }))}
                    className="py-2 rounded-xl text-xs font-bold transition-all duration-200 border"
                    id={`fuel-${ft}`}
                    style={form.fuel_type === ft ? {
                      background: `${FUEL_COLORS[ft]}15`,
                      color: FUEL_COLORS[ft],
                      borderColor: `${FUEL_COLORS[ft]}40`,
                      boxShadow: `0 0 12px ${FUEL_COLORS[ft]}20`,
                    } : {
                      background: 'rgba(30,45,66,0.4)',
                      color: '#4a6080',
                      borderColor: 'rgba(30,45,66,0.8)',
                    }}>
                    {ft.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </Field>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Volume (Liter)" required>
                <input name="volume_liters" className="input" type="number" step="0.01" min="1"
                  value={form.volume_liters} onChange={handleChange} required
                  placeholder="100" id="volume-liters" />
              </Field>
              <Field label="Harga per Liter (Rp)">
                <div className="relative">
                  <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#4a6080' }} />
                  <input name="price_per_liter" className="input pl-9 font-mono" type="number"
                    value={form.price_per_liter} onChange={handleChange} id="price-per-liter" />
                </div>
              </Field>
            </div>

            {/* Total price display */}
            <div className="rounded-xl p-4"
              style={{
                background: 'rgba(249,115,22,0.06)',
                border: '1px solid rgba(249,115,22,0.2)',
              }}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: '#8fa3bd' }}>Total Harga Estimasi</span>
                <span className="font-display text-xl font-bold text-gradient-orange">
                  Rp {total.toLocaleString('id-ID')}
                </span>
              </div>
              <p className="text-xs mt-1" style={{ color: '#4a6080' }}>
                {form.volume_liters || 0}L × Rp {Number(form.price_per_liter || 0).toLocaleString('id-ID')}
              </p>
            </div>

            <Field label="Catatan Tambahan">
              <textarea name="notes" className="input resize-none" rows={2}
                value={form.notes} onChange={handleChange}
                placeholder="Instruksi khusus untuk driver..." id="notes" />
            </Field>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-5">
          <button type="button" onClick={() => step > 0 ? setStep(s => s - 1) : navigate(-1)}
            className="btn-secondary flex-1" id="prev-step">
            {step === 0 ? 'Batal' : 'Kembali'}
          </button>

          {step < STEPS.length - 1 ? (
            <button type="button" onClick={nextStep} className="btn-primary flex-1" id="next-step">
              Lanjut <ChevronRight size={16} />
            </button>
          ) : (
            <button type="submit" className="btn-primary flex-1" disabled={loading} id="submit-delivery">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Menyimpan...</> : 'Buat Delivery'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
