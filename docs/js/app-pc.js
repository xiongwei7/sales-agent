// ╔══════════════════════════════════════════╗
// ║  PC Command Center — 指挥舱主控制器    ║
// ╚══════════════════════════════════════════╝

import { getData } from './mock-data.js';
import { MapRenderer } from './map-renderer.js';
import { $, $$, el, fmtK, fmtPct, fmtPctV } from './utils.js';

let role = new URLSearchParams(window.location.search).get('role') || 'ar';
let view = 'dashboard';
let data = getData(role);
let mapRenderer = null;

function init() {
  setRoleUI();
  renderDashboard();
  bindNav();
}

// ═══════════ NAVIGATION ═══════════
function setRoleUI() {
  $$('.role-btn').forEach(b => b.classList.toggle('active', b.dataset.role === role));
  const bc = role === 'gm' ? `${data.region} · ${data.territory}（管辖）` : `${data.region} · ${data.territory}`;
  const bcEl = $('#breadcrumb');
  if (bcEl) bcEl.textContent = bc;
  const nameEl = $('#userName');
  if (nameEl) nameEl.textContent = data.name;
}

function bindNav() {
  $$('.role-btn').forEach(b => b.addEventListener('click', () => {
    role = b.dataset.role;
    data = getData(role);
    setRoleUI();
    if (view === 'dashboard') renderDashboard();
    else showMap();
  }));

  $$('.view-btn').forEach(b => b.addEventListener('click', () => {
    view = b.dataset.view;
    $$('.view-btn').forEach(x => x.classList.toggle('active', x.dataset.view === view));
    if (view === 'dashboard') hideMap();
    else showMap();
  }));
}

// ═══════════ DASHBOARD RENDER ═══════════
function renderDashboard() {
  renderMetrics();
  if (role === 'ar') { renderCustomers(); }
  else { renderMemberRanking(); }
  renderBids();
  renderTasks();
  renderGap();
  renderActions();
  renderFeed();
}

// ── Module 1: Metrics ──
function renderMetrics() {
  const c = $('#metricsRow');
  if (!c) return;
  c.innerHTML = '';

  const t = data.targets;
  const items = [
    { label: 'Q2 REV',   v: fmtPct(t.rev.achieved, t.rev.target), sub: `${fmtK(t.rev.achieved)} / ${fmtK(t.rev.target)} · 排名${t.rev.rank}`, trend: t.rev.trend },
    { label: 'Q2 CA',    v: fmtPct(t.ca.achieved, t.ca.target), sub: `排名 ${t.ca.rank}`, trend: t.ca.trend },
  ];

  if (role === 'ar') {
    items.push(
      { label: '竞争力 A', v: fmtPctV(t.compA.achieved), sub: `排名 ${t.compA.rank}`, trend: t.compA.trend },
      { label: '竞争力 B', v: fmtPctV(t.compB.achieved), sub: `排名 ${t.compB.rank}`, trend: t.compB.trend },
    );
  }

  items.forEach(m => {
    const trendIcon = m.trend > 0 ? '▲' : m.trend < 0 ? '▼' : '—';
    const colorClass = m.trend > 0 ? 'success' : m.trend < 0 ? 'danger' : '';
    c.appendChild(el('div', { className: 'metric', innerHTML: `
      <div class="label">${m.label}</div>
      <div class="value ${colorClass}">${m.v} <span style="font-size:12px">${trendIcon}</span></div>
      <div class="sub">${m.sub}</div>
    ` }));
  });

  // GM extra: at-risk members
  if (role === 'gm') {
    const atRisk = data.members.filter(m => m.status === 'risk' || m.status === 'critical');
    c.appendChild(el('div', { className: 'metric', style: 'border-color:var(--danger);', innerHTML: `
      <div class="label">⚠ 需关注</div>
      <div class="value danger">${atRisk.length}<span style="font-size:12px">人</span></div>
      <div class="sub" style="color:var(--danger)">${atRisk.map(m=>m.name).join('、')}</div>
    ` }));
  }
}

// ── Module 2a: Customer Operations (AR) ──
function renderCustomers() {
  const c = $('#customerPanel');
  if (!c) return;
  c.innerHTML = `<div class="section-header"><span class="icon">👤</span><span class="title">客户经营情况</span><span class="badge badge-info">${data.customers.length}家</span></div>`;

  data.customers.forEach(cu => {
    const statusBadge = cu.status === 'good'
      ? '<span class="badge badge-success">● 正常</span>'
      : cu.status === 'stalled'
        ? '<span class="badge badge-warning">● 停滞</span>'
        : '<span class="badge badge-danger"><span class="pulse pulse-danger"></span>风险</span>';
    const yoyClass = cu.yoy > 0 ? 'color:var(--success)' : cu.yoy < 0 ? 'color:var(--danger)' : 'color:var(--text-muted)';
    const yoySign = cu.yoy > 0 ? '+' : '';

    c.appendChild(el('div', { className: 'row-item', innerHTML: `
      <span style="flex:2;font-weight:600">${cu.name}</span>
      <span class="mono" style="flex:1;text-align:right">${fmtK(cu.rev)}</span>
      <span class="mono" style="flex:0.8;text-align:right;${yoyClass}">${yoySign}${cu.yoy}%</span>
      <span style="flex:1.2;text-align:center">${statusBadge}</span>
      <span style="flex:0.6;text-align:right;color:var(--accent);cursor:pointer;font-size:10px" onclick="alert('进入${cu.name}客户经营详情')">详情 ▸</span>
    ` }));
  });
}

// ── Module 2b: Member Ranking (GM) ──
function renderMemberRanking() {
  const c = $('#customerPanel');
  if (!c) return;
  c.innerHTML = `<div class="section-header"><span class="icon">🏅</span><span class="title">成员达成率排名</span><span class="subtitle">${data.territory}</span></div>`;

  const sorted = [...data.members].sort((a, b) => b.rev - a.rev);
  sorted.forEach((m, i) => {
    const cls = m.status === 'good' ? 'success' : m.status === 'risk' ? 'warning' : 'danger';
    const txt = m.status === 'good' ? '优秀' : m.status === 'risk' ? '需关注' : '预警';
    c.appendChild(el('div', { className: 'row-item', innerHTML: `
      <span class="mono" style="width:22px;text-align:center;font-weight:700;color:var(--text-muted)">${i+1}</span>
      <span style="flex:1.5;font-weight:600">${m.name}</span>
      <span class="mono" style="flex:1;text-align:right">REV ${m.rev}%</span>
      <span class="mono" style="flex:1;text-align:right">CA ${m.ca}%</span>
      <span style="flex:1;text-align:center"><span class="badge badge-${cls}">${txt}</span></span>
      <span style="flex:0.6;text-align:right;color:var(--accent);cursor:pointer;font-size:10px" onclick="alert('🔍 下钻查看${m.name}个人作战导航')">下钻 ▸</span>
    ` }));
  });
}

// ── Module 3: Bid Board ──
function renderBids() {
  const c = $('#bidPanel');
  if (!c) return;
  c.innerHTML = `<div class="section-header"><span class="icon">📡</span><span class="title">标讯看板</span><span class="subtitle">${data.industries.join('、')}行业 · 自动过滤</span></div>`;

  const grid = el('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:12px' });

  // Intended column
  const intended = el('div', {});
  intended.appendChild(el('div', { style: 'font-size:11px;font-weight:700;color:var(--success);margin-bottom:8px', innerHTML: '🎯 意向标讯 <span style="font-weight:400;font-size:10px;color:var(--text-muted)">优先跟进</span>' }));
  data.bids.intended.forEach(b => intended.appendChild(bidItem(b, 'intended')));
  grid.appendChild(intended);

  // Public column
  const pub = el('div', {});
  pub.appendChild(el('div', { style: 'font-size:11px;font-weight:700;color:var(--warning);margin-bottom:8px', innerHTML: '📢 公开标讯 <span style="font-weight:400;font-size:10px;color:var(--text-muted)">需反馈</span>' }));
  data.bids.public.forEach(b => pub.appendChild(bidItem(b, 'public')));
  grid.appendChild(pub);

  c.appendChild(grid);
}

function bidItem(b, type) {
  const urgent = new Date(b.deadline) - new Date() < 3 * 86400000;
  const highTag = b.highValue ? '<span class="badge badge-high">高价值</span>' : '';

  if (type === 'intended') {
    return el('div', {
      style: `display:flex;align-items:center;gap:4px;padding:6px 8px;font-size:11px;border-bottom:1px solid var(--border-subtle);background:rgba(52,216,158,0.04);border-radius:4px;margin-bottom:2px`,
      innerHTML: `
        ${highTag}
        <span style="flex:2">${b.name}</span>
        <span class="mono" style="flex:1;text-align:right;color:var(--text-secondary)">${fmtK(b.amount)}</span>
        <span class="mono" style="flex:1.2;text-align:right;font-size:10px;${urgent ? 'color:var(--danger);font-weight:700' : 'color:var(--text-muted)'}">${b.deadline}${urgent ? ' ⚡' : ''}</span>
        <button class="btn btn-primary btn-xs">跟进</button>
      `
    });
  } else {
    const status = b.status === 'reported'
      ? '<span class="badge badge-success">✅ 已提报</span>'
      : '<span class="badge badge-danger">⚠ 待反馈</span>';
    return el('div', {
      style: `display:flex;align-items:center;gap:4px;padding:6px 8px;font-size:11px;border-bottom:1px solid var(--border-subtle);background:rgba(245,166,35,0.04);border-radius:4px;margin-bottom:2px`,
      innerHTML: `
        ${highTag}
        <span style="flex:2">${b.name}</span>
        <span class="mono" style="flex:1.2;text-align:right;font-size:10px;${urgent ? 'color:var(--danger);font-weight:700' : 'color:var(--text-muted)'}">${b.deadline}${urgent ? ' ⚡' : ''}</span>
        <span style="flex:1;text-align:center">${status}</span>
        ${b.status !== 'reported' ? `<button class="btn btn-ghost btn-xs">无法跟进</button><button class="btn btn-success btn-xs">提报商机</button>` : ''}
      `
    });
  }
}

// ── Module 4: Strategic Tasks ──
function renderTasks() {
  const c = $('#tasksPanel');
  if (!c) return;
  c.innerHTML = `<div class="section-header"><span class="icon">🎯</span><span class="title">战略任务达成</span></div>`;

  Object.values(data.strategicTasks).forEach(t => {
    const pct = Math.round(t.done / t.total * 100);
    const cls = pct >= 60 ? 'track-success' : pct >= 40 ? 'track-warning' : 'track-danger';
    c.appendChild(el('div', { style: 'margin-bottom:12px', innerHTML: `
      <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px">
        <span>${t.label}</span>
        <span class="mono"><b>${t.done}</b><span style="color:var(--text-muted)">/${t.total}</span></span>
      </div>
      <div class="progress"><div class="track ${cls}" style="width:${pct}%"></div></div>
    ` }));
  });

  if (role === 'gm') {
    c.appendChild(el('div', {
      style: 'margin-top:8px;padding:8px;border-radius:4px;background:rgba(245,59,87,0.08);font-size:10px;color:var(--danger)',
      innerHTML: '⚠ 王五 高价值客户仅 1/6 · 钱七 拜访量落后 · 赵六 重点战役未启动',
    }));
  }
}

// ── Module 5: Gap & Path ──
function renderGap() {
  const c = $('#gapPanel');
  if (!c) return;
  c.innerHTML = `<div class="section-header"><span class="icon">🔍</span><span class="title">差距 & 路径建议</span><span class="subtitle">AI 诊断 · 一键行动</span></div>`;

  if (role === 'ar') {
    c.appendChild(el('div', {
      style: 'padding:10px;border-radius:8px;background:rgba(245,166,35,0.06);border:1px solid rgba(245,166,35,0.15);margin-bottom:8px',
      innerHTML: `
        <div style="font-weight:600;font-size:12px;margin-bottom:4px;">⚠ REV 差距 ¥120K · 高价值客户缺口 3 家</div>
        <div style="font-size:10px;color:var(--text-muted);margin-bottom:4px">根因：高潜客户A未覆盖 · 客户B商机停滞 · 客户C续约风险</div>
        <div style="font-size:11px;color:var(--accent);margin-bottom:10px">→ 最优路径：客户A ¥200K → 标讯某银行 ¥800K → 续约客户C ¥50K</div>
        <button class="btn btn-primary btn-xs" onclick="alert('🤖 已触发作战计划Agent\n\n✅ 已生成本周重点拜访计划\n✅ 已同步到行动提醒')">📋 生成拜访计划</button>
        <button class="btn btn-ghost btn-xs" style="margin-left:4px" onclick="alert('🔍 已触发洞察Agent\n\n正在获取客户A 360画像和拜访资料...')">📁 获取客户资料</button>
      `
    }));
  } else {
    c.appendChild(el('div', {
      style: 'padding:10px;border-radius:8px;background:rgba(245,59,87,0.06);border:1px solid rgba(245,59,87,0.15);margin-bottom:8px',
      innerHTML: `
        <div style="font-weight:600;font-size:12px;margin-bottom:4px;">🚨 团队 REV 差距 ¥2,440K · 3 名成员落后</div>
        <div style="font-size:10px;color:var(--text-muted);margin-bottom:4px">王五 REV 28% · 钱七 拜访仅达标 40% · 赵六 新人达成 25%</div>
        <div style="font-size:11px;color:var(--accent);margin-bottom:10px">→ AI 建议：绩效面谈（王五）· 过程抽检（钱七）· 安排带教（赵六）</div>
        <button class="btn btn-primary btn-xs" onclick="alert('📅 已添加 王五绩效面谈 到周四 10:30\n✅ 已同步到行动提醒')">📅 安排面谈</button>
        <button class="btn btn-ghost btn-xs" style="margin-left:4px" onclick="alert('👀 已进入钱七拜访记录抽检\n最近一次拜访：4月28日\n拜访质量评分：6.2/10')">👀 过程抽检</button>
      `
    }));
  }
}

// ── Module 6a: Action Reminders ──
function renderActions() {
  const c = $('#actionsPanel');
  if (!c) return;
  c.innerHTML = `<div class="section-header"><span class="icon">📋</span><span class="title">当日行动提醒</span></div>`;

  const icons = { visit: '🔹', bid: '📡', meeting: '📅', task: '📌' };
  data.actions.forEach(a => {
    const urgent = a.priority >= 2;
    c.appendChild(el('div', {
      style: `padding:5px 0;font-size:11px;${urgent ? 'color:var(--danger)' : ''}`,
      innerHTML: `${icons[a.type] || '•'} <span class="mono" style="font-size:10px;color:var(--text-muted)">${a.time}</span> ${a.content}${urgent ? ' <span class="pulse pulse-danger"></span>' : ''}`,
    }));
  });

  if (role === 'gm') {
    c.appendChild(el('div', { style: 'margin-top:8px;padding-top:8px;border-top:1px solid var(--border-subtle)', innerHTML: `
      <div style="font-weight:600;font-size:11px;margin-bottom:6px;color:var(--purple)">👔 团队管理</div>
      <div style="font-size:10px;padding:2px 0">📌 10:30 与王五绩效面谈</div>
      <div style="font-size:10px;padding:2px 0">📌 抽检钱七本周拜访记录</div>
      <div style="font-size:10px;padding:2px 0">📌 赵六新人带教计划</div>
    ` }));
  }
}

// ── Module 6b: Agent Feed ──
function renderFeed() {
  const c = $('#feedPanel');
  if (!c) return;
  c.innerHTML = `<div class="section-header"><span class="icon">🤖</span><span class="title">Agent Feed</span><span class="badge badge-info" style="font-size:9px">实时</span></div>`;

  const colors = { warning: 'rgba(245,166,35,0.06)', success: 'rgba(52,216,158,0.06)', danger: 'rgba(245,59,87,0.06)', info: 'rgba(91,156,245,0.06)' };
  data.agentFeed.forEach(f => {
    const icon = f.type === 'danger' ? '🚨' : f.type === 'warning' ? '⚠' : f.type === 'success' ? '🏆' : '💡';
    c.appendChild(el('div', {
      style: `background:${colors[f.type] || colors.info};padding:8px 10px;border-radius:6px;margin-bottom:5px;font-size:10px;line-height:1.4`,
      innerHTML: `<span style="font-size:9px;color:var(--text-muted)">${f.from}</span><br>${icon} ${f.msg}`,
    }));
  });
}

// ═══════════ MAP ═══════════
function showMap() {
  const overlay = $('#mapOverlay');
  const grid = $('#pcGrid');
  if (!overlay || !grid) return;
  grid.style.display = 'none';
  overlay.style.display = 'flex';

  if (!mapRenderer) mapRenderer = new MapRenderer(overlay, role);
  mapRenderer.role = role;
  mapRenderer.data = getData(role);
  mapRenderer.level = role === 'gm' ? 'national' : 'territory';
  mapRenderer.render();
}

function hideMap() {
  const overlay = $('#mapOverlay');
  const grid = $('#pcGrid');
  if (!overlay || !grid) return;
  overlay.style.display = 'none';
  grid.style.display = 'grid';
}

// ═══════════ BOOT ═══════════
init();
