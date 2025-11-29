import React from 'react';

export default function Logo() {
  return (
    <div className="w-40 h-40 rounded-full bg-amber-900 flex items-center justify-center relative">
      <div className="absolute inset-0 rounded-full border-4 border-amber-100 opacity-30"></div>
      <div className="text-center">
        <div className="text-xs text-amber-100 tracking-widest mb-1">BREWING LOVE</div>
        <div className="text-3xl font-bold text-white italic" style={{ fontFamily: 'cursive' }}>
          Mcbyte's
        </div>
        <div className="text-3xl font-bold text-white italic" style={{ fontFamily: 'cursive' }}>
          Cafe
        </div>
        <div className="text-amber-200 text-2xl mt-1">☕</div>
      </div>
    </div>
  );
}