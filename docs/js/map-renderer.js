// ╔══════════════════════════════════════════╗
// ║  Map Renderer — 作战地图三层钻取       ║
// ╚══════════════════════════════════════════╝

import { el } from './utils.js';
import { getData } from './mock-data.js';

const PIN_COLORS = {
  sales:      { bg: '#5b9cf5', icon: '⬤', label: 'Sales' },
  customer:   { bg: '#34d89e', icon: '▣', label: '客户' },
  bid:        { bg: '#f5a623', icon: '◆', label: '标讯' },
  competitor: { bg: '#a78bfa', icon: '▲', label: '竞品' },
  partner:    { bg: '#5dade2', icon: '●', label: '伙伴' },
};

export class MapRenderer {
  constructor(container, role) {
    this.container = container;
    this.role = role;
    this.data = getData(role);
    this.level = role === 'gm' ? 'national' : 'territory';
  }

  render() {
    this.container.innerHTML = '';
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column';
    this.container.style.height = '100%';

    this.container.appendChild(this.breadcrumb());
    this.container.appendChild(this.canvas());
    this.container.appendChild(this.legend());
    this.container.appendChild(this.summary());
  }

  breadcrumb() {
    const levels = [
      { key: 'national', label: '🇨🇳 全国' },
      { key: 'region',   label: '🏢 华东大区' },
      { key: 'territory', label: `📍 ${this.data.territory}` },
    ];

    const visible = this.role === 'gm' ? levels : [levels[2]];
    const self = this;

    return el('div', {
      style: 'display:flex;gap:6px;align-items:center;padding:10px 16px;font-size:12px;flex-shrink:0',
    }, visible.flatMap((l, i) => {
      const active = l.key === self.level;
      const clickable = self.role === 'gm' && !active;
      const parts = [
        el('span', {
          className: active ? 'badge badge-info' : '',
          style: clickable ? 'cursor:pointer;color:var(--accent)' : active ? '' : 'color:var(--text-muted)',
          innerHTML: l.label + (active ? ' <span style="font-size:9px;opacity:0.7">● 当前位置</span>' : ''),
          onClick: clickable ? () => { self.level = l.key; self.render(); } : null,
        }),
      ];
      if (i < visible.length - 1) {
        parts.push(el('span', { innerHTML: '▸', style: 'color:var(--text-muted);margin:0 2px' }));
      }
      return parts;
    }));
  }

  canvas() {
    const area = el('div', {
      style: 'flex:1;padding:16px;overflow:auto;display:flex;flex-wrap:wrap;gap:12px;justify-content:center;align-content:flex-start',
    });

    if (this.level === 'national') this.renderCards(area, this.data.regions.national, '大区');
    else if (this.level === 'region') this.renderCards(area, this.data.regions.east, '战区');
    else this.renderPins(area);

    return area;
  }

  renderCards(area, items, unitLabel) {
    items.forEach(item => {
      const isMine = item.isMine;
      const self = this;
      area.appendChild(el('div', {
        className: 'map-region-card',
        style: `background:var(--bg-glass);backdrop-filter:var(--glass-blur);border:1px solid ${isMine ? 'var(--accent)' : 'var(--border-glass)'};border-radius:var(--radius-lg);padding:16px;cursor:pointer;min-width:155px;transition:all 0.25s;${isMine ? 'box-shadow:0 0 20px var(--accent-glow)' : ''}`,
        onmouseenter: function() { this.style.transform = 'translateY(-2px)'; this.style.borderColor = 'var(--border-active)'; },
        onmouseleave: function() { this.style.transform = ''; this.style.borderColor = isMine ? 'var(--accent)' : 'var(--border-glass)'; },
        onClick: () => {
          if (self.level === 'national') { self.level = 'region'; self.render(); }
          else { self.level = 'territory'; self.render(); }
        },
      }, [
        el('div', {
          style: `font-weight:700;font-size:14px;${isMine ? 'color:var(--accent)' : ''}`,
          innerHTML: `${item.name} ${isMine ? '<span style="font-size:10px;color:var(--accent)">◀ 我的' + unitLabel + '</span>' : ''}`,
        }),
        el('div', {
          style: 'font-family:var(--font-mono);font-size:20px;font-weight:700;margin:8px 0',
          innerHTML: `<span style="color:var(--success)">${item.rev}%</span>`,
        }),
        el('div', { style: 'font-size:11px;color:var(--text-muted)', innerHTML: `排名 ${item.rank} · ${item.territories || item.sales + '人 · ' + item.customers + '家客户'}` }),
      ]);
    });
  }

  renderPins(area) {
    area.style.position = 'relative';
    area.style.minHeight = '380px';
    area.style.background = `
      radial-gradient(circle at 50% 50%, rgba(91,156,245,0.06) 0%, transparent 70%),
      linear-gradient(0deg, rgba(15,21,33,0.6) 0%, rgba(15,21,33,0.3) 100%),
      repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.015) 39px, rgba(255,255,255,0.015) 40px),
      repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.015) 39px, rgba(255,255,255,0.015) 40px)
    `;
    area.style.borderRadius = 'var(--radius-lg)';
    area.style.border = '1px solid var(--border-glass)';

    const pins = this.data.mapPins || [];
    pins.forEach(pin => {
      const style = PIN_COLORS[pin.type] || PIN_COLORS.customer;
      const isCircle = pin.type === 'sales';

      area.appendChild(el('div', {
        style: `
          position:absolute;top:${pin.y}%;left:${pin.x}%;
          background:${style.bg};color:#fff;
          ${isCircle
            ? 'width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;'
            : 'padding:2px 7px;border-radius:4px;font-size:9px;font-weight:600;white-space:nowrap;'}
          cursor:pointer;z-index:2;transition:all 0.2s;box-shadow:0 0 12px ${style.bg}44;
        `,
        onClick: () => this.onPinClick(pin),
        onmouseenter: function() { this.style.transform = 'scale(1.15)'; this.style.zIndex = '10'; },
        onmouseleave: function() { this.style.transform = ''; this.style.zIndex = '2'; },
      }, [
        isCircle ? pin.name.charAt(0) : el('span', { innerHTML: `${style.icon} ${pin.name}` }),
        pin.status === 'risk' ? el('span', { className: 'pulse pulse-danger', style: 'position:absolute;top:-2px;right:-2px' }) : null,
      ]));
    });
  }

  onPinClick(pin) {
    const typeLabel = { sales: 'Sales', customer: '客户', bid: '标讯', competitor: '竞品', partner: '渠道伙伴' };
    let detail = `📍 <b>${pin.name}</b>\n类型：${typeLabel[pin.type] || pin.type}`;
    if (pin.rev) detail += `\nREV 达成：${pin.rev}%`;
    if (pin.status) detail += `\n状态：${pin.status === 'risk' ? '⚠️ 风险' : '✅ 正常'}`;
    if (pin.highValue) detail += '\n⭐ 高价值标讯';
    if (pin.deadline) detail += `\n截止：${pin.deadline}`;
    detail += '\n\n点击确认跳转详情页 →';
    alert(detail.replace(/\n/g, '\n'));
  }

  legend() {
    return el('div', {
      style: 'display:flex;gap:16px;justify-content:center;padding:8px 16px;font-size:10px;color:var(--text-muted);flex-shrink:0',
    }, Object.entries(PIN_COLORS).map(([key, s]) =>
      el('div', { style: 'display:flex;align-items:center;gap:4px' }, [
        el('span', { style: `display:inline-block;width:10px;height:10px;background:${s.bg};border-radius:${key === 'sales' ? '50%' : '2px'}` }),
        el('span', { innerHTML: s.label }),
      ])
    ));
  }

  summary() {
    let text = '';
    if (this.level === 'national') text = '6 个大区 · 全国 REV 均值 42% · 华东大区领先';
    else if (this.level === 'region') text = '华东大区 · 6 个战区 · REV 达成 48% · 全国排名 1/6';
    else text = `${this.role === 'gm' ? '浙江战区 · ' : ''}Sales ${this.role === 'gm' ? '6' : '8'}人 · 客户 24 家 · 标讯 5 条 · 竞品 3 个`;

    return el('div', {
      style: 'text-align:center;padding:10px;margin:12px;font-size:11px;color:var(--text-muted);background:var(--bg-card);border-radius:var(--radius-sm);border:1px solid var(--border-subtle);flex-shrink:0',
      innerHTML: `📊 ${text}`,
    });
  }
}
