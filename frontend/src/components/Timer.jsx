import { useState, useEffect } from 'react';

export default function Timer({ seconds, label = 'Time Remaining' }) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const pad = (n) => String(n).padStart(2, '0');

  const isUrgent = seconds <= 300; // last 5 minutes
  const isCritical = seconds <= 60;

  return (
    <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border transition-all duration-500
      ${isCritical ? 'bg-danger-500/10 border-danger-500/30 animate-pulse' :
        isUrgent ? 'bg-warning-500/10 border-warning-500/30' :
        'bg-surface-800/60 border-white/5'}`}>
      <div className={`w-2 h-2 rounded-full ${isCritical ? 'bg-danger-400' : isUrgent ? 'bg-warning-400' : 'bg-accent-400'} animate-pulse`} />
      <span className="text-xs text-surface-100/50 uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-1 font-mono font-bold">
        {hrs > 0 && (
          <>
            <span className={`text-lg ${isCritical ? 'text-danger-400' : 'text-white'}`}>{pad(hrs)}</span>
            <span className="text-surface-100/30">:</span>
          </>
        )}
        <span className={`text-lg ${isCritical ? 'text-danger-400' : 'text-white'}`}>{pad(mins)}</span>
        <span className="text-surface-100/30">:</span>
        <span className={`text-lg ${isCritical ? 'text-danger-400' : 'text-white'}`}>{pad(secs)}</span>
      </div>
    </div>
  );
}
