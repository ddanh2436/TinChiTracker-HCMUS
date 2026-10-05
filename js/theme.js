// Chạy trong <head> để đặt theme trước khi vẽ trang (tránh nháy màu).
(() => {
  const KEY = 'tinchi-tracker:theme';
  const mq = matchMedia('(prefers-color-scheme: dark)');
  const get = () => {
    try { const t = localStorage.getItem(KEY); return ['light', 'dark'].includes(t) ? t : 'system'; } catch { return 'system'; }
  };
  const apply = () => {
    const t = get();
    document.documentElement.dataset.theme = t === 'system' ? (mq.matches ? 'dark' : 'light') : t;
  };
  apply();
  mq.addEventListener('change', apply);
  window.TCT_THEME = {
    get,
    set(t) { try { localStorage.setItem(KEY, t); } catch { /* ignore */ } apply(); },
  };
})();
