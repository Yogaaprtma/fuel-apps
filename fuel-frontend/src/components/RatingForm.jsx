import React, { useState } from 'react';
import { Star, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { ratingApi } from '../services/api';

export default function RatingForm({ delivery, onRated }) {
  const [rating,  setRating]  = useState(0);
  const [hover,   setHover]   = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);

  if (done || delivery.rating) {
    const r = delivery.rating?.rating || rating;
    return (
      <div className="flex items-center gap-3 py-2">
        <div className="flex gap-0.5">
          {[1,2,3,4,5].map(i => (
            <Star key={i} size={18}
              fill={i <= r ? '#F59E0B' : 'none'}
              stroke={i <= r ? '#F59E0B' : '#CBD5E1'}
            />
          ))}
        </div>
        <span className="text-sm font-semibold text-amber-600">{r}/5</span>
        <span className="text-xs text-slate-400">Terima kasih atas penilaian Anda!</span>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!rating) return toast.error('Pilih bintang terlebih dahulu');
    setLoading(true);
    try {
      await ratingApi.submit(delivery.id, { rating, comment: comment || null });
      toast.success('⭐ Rating berhasil dikirim!');
      setDone(true);
      onRated?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengirim rating');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#FFFBEB' }}>
          <Star size={16} style={{ color: '#F59E0B' }} fill="#F59E0B" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">Beri Rating Driver</p>
          <p className="text-xs text-slate-400">Bagaimana pelayanan driver Anda?</p>
        </div>
      </div>

      {/* Stars */}
      <div className="flex gap-1.5 justify-center py-2">
        {[1,2,3,4,5].map(i => (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(i)}
            className="transition-transform hover:scale-110 active:scale-95"
          >
            <Star
              size={36}
              fill={i <= (hover || rating) ? '#F59E0B' : 'none'}
              stroke={i <= (hover || rating) ? '#F59E0B' : '#CBD5E1'}
              className="transition-colors"
            />
          </button>
        ))}
      </div>
      {rating > 0 && (
        <p className="text-center text-sm font-medium text-amber-600">
          {['','Sangat Buruk 😞','Buruk 😕','Cukup 😐','Bagus 😊','Sangat Bagus 🤩'][rating]}
        </p>
      )}

      <textarea
        className="input resize-none text-sm"
        rows={2}
        placeholder="Komentar (opsional)..."
        value={comment}
        onChange={e => setComment(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        disabled={loading || !rating}
        className="btn-primary w-full"
      >
        {loading
          ? <><Loader2 size={15} className="animate-spin" /> Mengirim...</>
          : <><CheckCircle size={15} /> Kirim Rating</>
        }
      </button>
    </div>
  );
}
