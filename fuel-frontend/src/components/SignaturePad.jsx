import React, { useRef, useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';

export default function SignaturePad({ onChange }) {
  const canvasRef = useRef(null);
  const isDrawing  = useRef(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    ctx.lineWidth   = 2.5;
    ctx.lineCap     = 'round';
    ctx.strokeStyle = '#0F172A';
    ctx.fillStyle   = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const src  = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * (canvasRef.current.width / rect.width),
      y: (src.clientY - rect.top)  * (canvasRef.current.height / rect.height),
    };
  };

  const start = (e) => {
    e.preventDefault();
    isDrawing.current = true;
    const ctx = canvasRef.current.getContext('2d');
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setIsEmpty(false);
    onChange?.(canvasRef.current.toDataURL('image/png'));
  };

  const stop = () => { isDrawing.current = false; };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    onChange?.(null);
  };

  return (
    <div className="space-y-2">
      <div className="relative rounded-xl overflow-hidden" style={{ border: '2px solid #E2E8F0', background: '#FFFFFF' }}>
        <canvas
          ref={canvasRef}
          width={600}
          height={180}
          style={{ width: '100%', height: '140px', cursor: 'crosshair', touchAction: 'none' }}
          onMouseDown={start}
          onMouseMove={draw}
          onMouseUp={stop}
          onMouseLeave={stop}
          onTouchStart={start}
          onTouchMove={draw}
          onTouchEnd={stop}
        />
        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-sm text-slate-300">Tanda tangan di sini...</p>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={clear}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-500 transition-colors"
      >
        <RotateCcw size={12} /> Hapus tanda tangan
      </button>
    </div>
  );
}
