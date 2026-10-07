// Site-wide background brightness, set with the slider in the viewer and
// remembered in this browser. vite.config.js inlines this script at the top
// of every page's <head>, so the saved shade applies before the first paint.
// Pages read --bg, and switch to dark text when <html> has .light-bg.
(() => {
  const DARK = [0x11, 0x11, 0x13];
  const LIGHT = [0xe4, 0xe4, 0xe1];
  const KEY = 'background';

  let value = 0; // 0 (near-black) to 100 (light gray)
  let css = '';

  function apply() {
    const t = value / 100;
    // Blend in sRGB, so the slider steps look even.
    css = `rgb(${DARK.map((d, i) => Math.round(d + (LIGHT[i] - d) * t)).join(', ')})`;
    document.documentElement.style.setProperty('--bg', css);
    document.documentElement.classList.toggle('light-bg', t > 0.45);
  }

  try {
    value = Math.min(100, Math.max(0, Number(localStorage.getItem(KEY)) || 0));
  } catch {}
  apply();

  window.siteBackground = {
    value: () => value,
    css: () => css,
    set(v) {
      value = v;
      apply();
      try {
        localStorage.setItem(KEY, String(v));
      } catch {}
    },
  };
})();
