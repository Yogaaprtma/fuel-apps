import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Loader2, MapPin, ChevronRight, Fuel, User, Phone, Navigation, DollarSign, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import useDeliveryStore from '../store/deliveryStore';
import { userApi } from '../services/api';

const FUEL_TYPES = ['PERTALITE','PERTAMAX','PERTAMAX_TURBO','SOLAR','DEXLITE'];
const FUEL_PRICES = {
  PERTALITE: 10000, PERTAMAX: 13500, PERTAMAX_TURBO: 15000,
  SOLAR: 6800, DEXLITE: 15800,
};
const FUEL_STYLES = {
  PERTALITE:      { color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
  PERTAMAX:       { color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
  PERTAMAX_TURBO: { color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
  SOLAR:          { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  DEXLITE:        { color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA' },
};

const INITIAL_FORM = {
  driver_id: '', customer_id: '', customer_name: '', customer_phone: '',
  destination_address: '', destination_lat: '', destination_lng: '',
  geofence_radius: 200, fuel_type: 'PERTALITE',
  volume_liters: '', price_per_liter: FUEL_PRICES.PERTALITE, notes: '',
};

const STEPS = ['Driver & Customer', 'Lokasi Tujuan', 'Detail BBM'];

function Field({ label, required, hint, children }) {
  return (
    <div>
      <label className="label">
        {label} {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs mt-1 text-slate-400">{hint}</p>}
    </div>
  );
}

export default function DeliveryCreate() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { createDelivery }  = useDeliveryStore();
  const [drivers,    setDrivers]    = useState([]);
  const [customers,  setCustomers]  = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [step,       setStep]       = useState(0);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Baca prefill dari navigasi Repeat Order
  const prefill = location.state?.prefill ?? {};
  const [form, setForm] = useState({
    ...INITIAL_FORM,
    ...prefill,
    // Pastikan price_per_liter disesuaikan dengan fuel_type jika ada prefill
    price_per_liter: prefill.price_per_liter
      ?? FUEL_PRICES[prefill.fuel_type] 
      ?? FUEL_PRICES.PERTALITE,
  });

  useEffect(() => {
    userApi.drivers().then(res => setDrivers(res.data));
    userApi.customers().then(res => setCustomers(res.data)).catch(() => {});
    // Jika dari Repeat Order, skip langsung ke step BBM
    if (location.state?.prefill) {
      setStep(0); // tetap mulai dari step 1 agar driver bisa diganti
    }
  }, []);

  const total = (form.volume_liters || 0) * (form.price_per_liter || 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev, [name]: value,
      ...(name === 'fuel_type' ? { price_per_liter: FUEL_PRICES[value] } : {}),
    }));
  };

  // Saat customer dipilih dari dropdown, auto-fill nama & HP
  const handleCustomerSelect = (e) => {
    const cid = e.target.value;
    if (!cid) {
      setForm(prev => ({ ...prev, customer_id: '', customer_name: '', customer_phone: '' }));
      return;
    }
    const cust = customers.find(c => String(c.id) === String(cid));
    setForm(prev => ({
      ...prev,
      customer_id:    cid,
      customer_name:  cust?.name  || prev.customer_name,
      customer_phone: cust?.phone || prev.customer_phone,
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
          <h1 className="page-title">Buat Pengiriman Baru</h1>
          <p className="page-subtitle">Isi informasi pengiriman bahan bakar</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="card !p-4 mb-5">
        <div className="flex items-center">
          {STEPS.map((label, i) => (
            <React.Fragment key={i}>
              <button
                onClick={() => i < step && setStep(i)}
                className="flex items-center gap-2 transition-all duration-200"
                style={{ cursor: i < step ? 'pointer' : 'default' }}
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                  style={{
                    background: i < step ? '#ECFDF5' : i === step ? '#2563EB' : '#F1F5F9',
                    color:      i < step ? '#059669' : i === step ? 'white' : '#94A3B8',
                    border:     i < step ? '2px solid #A7F3D0' : i === step ? '2px solid #2563EB' : '2px solid #E2E8F0',
                  }}>
                  {i < step ? <CheckCircle size={14} /> : i + 1}
                </div>
                <span className="text-xs font-medium hidden sm:block"
                  style={{ color: i === step ? '#2563EB' : i < step ? '#10B981' : '#94A3B8' }}>
                  {label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 rounded-full"
                  style={{ background: i < step ? '#A7F3D0' : '#E2E8F0' }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 0 */}
        {step === 0 && (
          <div className="card space-y-5 animate-slide-up">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#EFF6FF' }}>
                <User size={16} style={{ color: '#2563EB' }} />
              </div>
              <h2 className="font-semibold text-sm" style={{ color: '#0F172A' }}>Driver & Customer</h2>
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

            {/* Dropdown pilih customer terdaftar */}
            {customers.length > 0 && (
              <Field label="Pilih Customer (Terdaftar)"
                hint="Pilih customer dari sistem agar delivery terhubung ke akun mereka">
                <select
                  value={form.customer_id}
                  onChange={handleCustomerSelect}
                  className="input"
                  id="customer-select"
                >
                  <option value="">-- Atau input manual di bawah --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}{c.phone ? ` (${c.phone})` : ''}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Nama Customer" required>
                <input name="customer_name" className="input" value={form.customer_name}
                  onChange={handleChange} required placeholder="Nama pelanggan" id="customer-name" />
              </Field>
              <Field label="Nomor HP" required>
                <div className="relative">
                  <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input name="customer_phone" className="input pl-10" type="tel"
                    value={form.customer_phone} onChange={handleChange} required
                    placeholder="08xxxxxxxxxx" id="customer-phone" />
                </div>
              </Field>
            </div>
          </div>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <div className="card space-y-5 animate-slide-up">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#FFF7ED' }}>
                <MapPin size={16} style={{ color: '#F97316' }} />
              </div>
              <h2 className="font-semibold text-sm" style={{ color: '#0F172A' }}>Lokasi Tujuan</h2>
            </div>

            <Field label="Alamat Lengkap" required>
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
              className="btn-secondary text-sm w-full" id="get-gps">
              {gpsLoading
                ? <><Loader2 size={15} className="animate-spin" /> Mengambil GPS...</>
                : <><Navigation size={15} className="text-blue-500" /> Gunakan Lokasi GPS Saat Ini</>
              }
            </button>

            <Field label="Radius Geofencing (meter)"
              hint="Area validasi saat driver tiba di tujuan. Default: 200m">
              <input name="geofence_radius" className="input" type="number" min="50" max="2000"
                value={form.geofence_radius} onChange={handleChange} id="geofence-radius" />
            </Field>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="card space-y-5 animate-slide-up">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#EFF6FF' }}>
                <Fuel size={16} style={{ color: '#2563EB' }} />
              </div>
              <h2 className="font-semibold text-sm" style={{ color: '#0F172A' }}>Detail Bahan Bakar</h2>
            </div>

            {/* Fuel type selector */}
            <Field label="Jenis BBM" required>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-1">
                {FUEL_TYPES.map(ft => {
                  const s = FUEL_STYLES[ft];
                  const isActive = form.fuel_type === ft;
                  return (
                    <button key={ft} type="button"
                      onClick={() => setForm(p => ({ ...p, fuel_type: ft, price_per_liter: FUEL_PRICES[ft] }))}
                      className="py-2.5 rounded-xl text-xs font-bold transition-all duration-200"
                      id={`fuel-${ft}`}
                      style={isActive
                        ? { background: s.bg, color: s.color, border: `1.5px solid ${s.border}` }
                        : { background: '#F8FAFC', color: '#94A3B8', border: '1.5px solid #E2E8F0' }
                      }>
                      {ft.replace('_', ' ')}
                    </button>
                  );
                })}
              </div>
            </Field>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Volume (Liter)" required>
                <input name="volume_liters" className="input" type="number" step="0.01" min="1"
                  value={form.volume_liters} onChange={handleChange} required
                  placeholder="100" id="volume-liters" />
              </Field>
              <Field label="Harga per Liter (Rp)">
                <input name="price_per_liter" className="input font-mono" type="number"
                  value={form.price_per_liter} onChange={handleChange} id="price-per-liter" />
              </Field>
            </div>

            {/* Total price */}
            <div className="rounded-xl p-4" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">Total Harga Estimasi</span>
                <span className="text-2xl font-bold" style={{ color: '#2563EB' }}>
                  Rp {total.toLocaleString('id-ID')}
                </span>
              </div>
              <p className="text-xs mt-1 text-slate-400">
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

        {/* Navigation */}
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
              {loading ? <><Loader2 size={16} className="animate-spin" /> Menyimpan...</> : 'Buat Pengiriman'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
