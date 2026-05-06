export const $ = (s, p = document) => p.querySelector(s);
export const $$ = (s, p = document) => Array.from(p.querySelectorAll(s));

export const el = (tag, attrs = {}, children = []) => {
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'className') e.className = v;
    else if (k === 'innerHTML') e.innerHTML = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2).toLowerCase(), v);
    else e.setAttribute(k, v);
  });
  children.forEach(c => {
    if (typeof c === 'string') e.appendChild(document.createTextNode(c));
    else if (c instanceof Node) e.appendChild(c);
  });
  return e;
};

export const fmtK = (n) => n >= 1000 ? `¥${(n / 1000).toFixed(0)}K` : `¥${n}`;
export const fmtPct = (a, t) => Math.round(a / t * 100) + '%';
export const fmtPctV = (v) => v + '%';

export const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
