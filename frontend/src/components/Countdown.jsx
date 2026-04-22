export default function Countdown({ seconds }) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center animate-fade-in">
      {/* Background glow effect */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-96 h-96 bg-primary-600/10 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      <div className="relative z-10 text-center">
        <div className="mb-6">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium animate-pulse">
            ● Contest Starting Soon
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-surface-100/70 mb-10">
          Contest begins in
        </h1>

        <div className="flex items-center justify-center gap-4 md:gap-6">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-surface-800/80 border border-white/10 flex items-center justify-center shadow-2xl shadow-primary-600/10 animate-glow">
              <span className="text-4xl md:text-6xl font-bold font-mono bg-gradient-to-b from-white to-surface-100/60 bg-clip-text text-transparent">
                {pad(mins)}
              </span>
            </div>
            <span className="mt-3 text-xs text-surface-100/40 uppercase tracking-widest">Minutes</span>
          </div>

          <span className="text-4xl md:text-5xl font-bold text-primary-400 animate-pulse mb-8">:</span>

          <div className="flex flex-col items-center">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-surface-800/80 border border-white/10 flex items-center justify-center shadow-2xl shadow-primary-600/10 animate-glow">
              <span className="text-4xl md:text-6xl font-bold font-mono bg-gradient-to-b from-white to-surface-100/60 bg-clip-text text-transparent">
                {pad(secs)}
              </span>
            </div>
            <span className="mt-3 text-xs text-surface-100/40 uppercase tracking-widest">Seconds</span>
          </div>
        </div>

        <p className="mt-12 text-surface-100/40 text-sm max-w-md mx-auto">
          Get ready! The problems and editor will appear once the countdown reaches zero.
        </p>
      </div>
    </div>
  );
}
