import api from '../api/axios';

let warningCount = 0;
let onTerminate = null;
let onWarn = null;

export function initAntiCheat(terminateCb, warnCb) {
  warningCount = 0;
  onTerminate = terminateCb;
  onWarn = warnCb;

  // Tab switch / visibility change detection
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Block right-click
  document.addEventListener('contextmenu', preventDefault);

  // Block copy/paste shortcuts
  document.addEventListener('keydown', handleKeydown);

  // Block paste
  document.addEventListener('paste', preventDefault);
  document.addEventListener('copy', preventDefault);
  document.addEventListener('cut', preventDefault);
}

export function destroyAntiCheat() {
  document.removeEventListener('visibilitychange', handleVisibilityChange);
  document.removeEventListener('contextmenu', preventDefault);
  document.removeEventListener('keydown', handleKeydown);
  document.removeEventListener('paste', preventDefault);
  document.removeEventListener('copy', preventDefault);
  document.removeEventListener('cut', preventDefault);
}

function preventDefault(e) {
  e.preventDefault();
  return false;
}

function handleKeydown(e) {
  // Block Ctrl+C, Ctrl+V, Ctrl+X (outside Monaco editor)
  if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x'].includes(e.key.toLowerCase())) {
    // Allow inside Monaco editor
    if (e.target.closest('.monaco-editor')) return;
    e.preventDefault();
  }
}

async function handleVisibilityChange() {
  if (document.hidden) {
    warningCount++;

    try {
      await api.post('/auth/warning');
    } catch (err) {
      console.error('Failed to report warning:', err);
    }

    if (warningCount >= 3) {
      onTerminate?.();
    } else {
      onWarn?.(warningCount);
    }
  }
}

export function getWarningCount() {
  return warningCount;
}
