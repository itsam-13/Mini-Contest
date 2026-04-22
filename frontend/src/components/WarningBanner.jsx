export default function WarningBanner({ count }) {
  if (count === 0) return null;

  const messages = [
    '',
    '⚠️ Warning: Tab switch detected! This is your 1st warning.',
    '🚨 Final Warning: One more tab switch and your contest will end!',
    '❌ Contest terminated due to repeated tab switching.',
  ];

  const isFinal = count >= 3;
  const msg = messages[Math.min(count, 3)];

  return (
    <div className={`fixed top-16 left-0 right-0 z-40 animate-slide-up
      ${isFinal ? 'bg-danger-600' : count === 2 ? 'bg-danger-500/90' : 'bg-warning-500/90'}
      backdrop-blur-sm shadow-lg`}>
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <p className="text-sm font-medium text-white">{msg}</p>
        <span className="text-xs font-mono bg-black/20 px-2 py-1 rounded text-white/80">
          {count}/3 warnings
        </span>
      </div>
    </div>
  );
}
