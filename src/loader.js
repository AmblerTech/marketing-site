const KEY = 'amb-v2';

export function shouldEnable(search, storage) {
  const m = /[?&]v2=([01])(?=&|$)/.exec(search || '');
  if (m) {
    try {
      if (m[1] === '1') storage.setItem(KEY, '1');
      else storage.removeItem(KEY);
    } catch (e) { /* storage blocked: honour the param for this view only */ }
    return m[1] === '1';
  }
  try { return !!storage && storage.getItem(KEY) === '1'; } catch (e) { return false; }
}

function safeStorage(win) {
  try { return win.localStorage; } catch (e) { return null; }
}

export function boot(win, doc, opts) {
  const on = opts.alwaysOn || shouldEnable(win.location.search, safeStorage(win));
  if (!on) return false;
  doc.documentElement.classList.add('amb-v2');
  const link = doc.createElement('link');
  link.rel = 'stylesheet';
  link.href = opts.cdn + 'ambler.css';
  doc.head.appendChild(link);
  const script = doc.createElement('script');
  script.src = opts.cdn + 'ambler.js';
  script.defer = true;
  doc.head.appendChild(script);
  return true;
}
