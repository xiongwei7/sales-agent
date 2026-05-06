// ╔══════════════════════════════════════════╗
// ║  Mobile Controller — 对话卡片流       ║
// ╚══════════════════════════════════════════╝

import { getData } from './mock-data.js';
import { AgentSimulator } from './agent-simulator.js';
import { $, $$, el, fmtK, fmtPct, fmtPctV } from './utils.js';

let role = new URLSearchParams(window.location.search).get('role') || 'ar';
let data = getData(role);
let sim;

function init() {
  sim = new AgentSimulator(addMsg, handleAction);
  updateUI();
  setTimeout(() => runGreeting(), 500);
  bindEvents();
}

function updateUI() {
  const sub = $('#mobileSubtitle');
  if (sub) sub.textContent = role === 'gm' ? `作战导航 · ${data.territory}（管辖）` : `作战导航 · ${data.territory}`;
}

// ═══════ CHAT RENDERING ═══════
function addMsg(text) {
  const chat = $('#chatArea');
  if (!chat) return;
  chat.appendChild(el('div', { className: 'msg msg-agent', innerHTML: `
    <div class="msg-avatar">🤖</div>
    <div class="bubble bubble-agent">${text}</div>
  ` }));
  scrollDown();
}

function addUserMsg(text) {
  const chat = $('#chatArea');
  if (!chat) return;
  chat.appendChild(el('div', { className: 'msg msg-user', innerHTML: `
    <div class="bubble bubble-user">${text}</div>
  ` }));
  scrollDown();
}

function addCard(html) {
  const chat = $('#chatArea');
  if (!chat) return;
  chat.appendChild(el('div', { className: 'chat-card', innerHTML: html }));
  scrollDown();
}

function scrollDown() {
  const chat = $('#chatArea');
  if (chat) setTimeout(() => { chat.scrollTop = chat.scrollHeight; }, 100);
}

function handleAction(action, extra) {
  switch (action) {
    case 'push_metrics': pushMetricsCard(); break;
    case 'push_gap': pushGapCard(); break;
    case 'push_case_card': pushCaseCard(); break;
  }
}

// ═══════ CARDS ═══════
function pushMetricsCard() {
  const t = data.targets;
  const items = role === 'ar'
    ? [
      { l: 'Q2 REV', v: fmtPct(t.rev.achieved, t.rev.target), c: 'danger', s: `排名 ${t.rev.rank}` },
      { l: 'Q2 CA', v: fmtPct(t.ca.achieved, t.ca.target), c: 'success', s: `排名 ${t.ca.rank}` },
      { l: '竞争力A', v: fmtPctV(t.compA.achieved), c: '', s: `排名 ${t.compA.rank}` },
      { l: '竞争力B', v: fmtPctV(t.compB.achieved), c: '', s: `排名 ${t.compB.rank}` },
    ]
    : [
      { l: '团队 REV', v: fmtPct(t.rev.achieved, t.rev.target), c: 'success', s: `战区排名 ${t.rev.rank}` },
      { l: '团队 CA', v: fmtPct(t.ca.achieved, t.ca.target), c: 'success', s: `战区排名 ${t.ca.rank}` },
    ];

  addCard(`
    <div style="font-weight:700;font-size:12px;margin-bottom:8px">📊 经营目标全景</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
      ${items.map(i => `
        <div style="background:var(--bg-card);border-radius:8px;padding:10px;text-align:center;border:1px solid var(--border-glass)">
          <div style="font-size:9px;color:var(--text-muted)">${i.l}</div>
          <div class="mono" style="font-size:18px;font-weight:700;${i.c ? 'color:var(--' + i.c + ')' : ''}">${i.v}</div>
          <div style="font-size:9px;color:var(--text-muted)">${i.s}</div>
        </div>
      `).join('')}
    </div>
    ${role === 'gm' ? '<div style="margin-top:6px;font-size:10px;color:var(--danger)">⚠ 王五、钱七需重点关注</div>' : ''}
    <div style="color:var(--accent);font-size:10px;margin-top:6px;cursor:pointer" onclick="alert('展开完整看板')">查看完整看板 →</div>
  `);
}

function pushGapCard() {
  if (role === 'ar') {
    addCard(`
      <div style="font-weight:700;font-size:12px;margin-bottom:6px">🔍 差距 & 路径建议</div>
      <div style="font-size:10px;color:var(--text-muted);margin-bottom:4px">⚠ REV 差距 ¥120K · 高价值客户缺口 3 家</div>
      <div style="font-size:10px;color:var(--accent);margin-bottom:8px">→ 最优路径：客户A ¥200K → 标讯某银行 ¥800K</div>
      <button class="btn btn-primary btn-xs" onclick="handleUserAction('帮我生成拜访计划')">📋 生成拜访计划</button>
      <button class="btn btn-ghost btn-xs" style="margin-left:4px" onclick="handleUserAction('看看教练建议')">🎓 教练建议</button>
    `);
  } else {
    addCard(`
      <div style="font-weight:700;font-size:12px;margin-bottom:6px">🚨 团队差距 & 管理建议</div>
      <div style="font-size:10px;color:var(--text-muted);margin-bottom:4px">王五 REV 28% · 钱七 拜访落后 · 赵六 新人达成 25%</div>
      <div style="font-size:10px;color:var(--accent);margin-bottom:8px">→ 建议：绩效面谈（王五）· 过程抽检（钱七）· 带教（赵六）</div>
      <button class="btn btn-primary btn-xs" onclick="handleUserAction('帮我安排管理动作')">📅 安排管理动作</button>
      <button class="btn btn-ghost btn-xs" style="margin-left:4px" onclick="handleUserAction('看看团队地图')">🗺️ 查看团队地图</button>
    `);
  }
}

function pushCaseCard() {
  addCard(`
    <div style="font-weight:700;font-size:12px;margin-bottom:4px;color:var(--success)">🏆 优秀案例：客户异议处理</div>
    <div style="font-size:10px;color:var(--text-muted);margin-bottom:4px">王五 在拜访某制造企业时，成功化解客户预算异议，最终签单 ¥500K。</div>
    <div style="font-size:10px;margin-bottom:6px">核心方法：<b>先共情理解 → 数据化价值说服 → 提供替代方案</b></div>
    <button class="btn btn-primary btn-xs" onclick="handleUserAction('开始模拟陪练')">🎓 开始模拟陪练</button>
  `);
}

// ═══════ USER INTERACTION ═══════
function handleUserAction(text) {
  addUserMsg(text);
  setTimeout(() => {
    if (text.includes('拜访计划')) sim.run('trigger_plan');
    else if (text.includes('教练') || text.includes('陪练')) sim.run('trigger_coach');
    else if (text.includes('管理动作')) sim.run('trigger_manage');
    else if (text.includes('团队地图')) pushMapCard();
    else if (text.includes('标讯')) pushBidCard();
    else addMsg('好的，我来帮你处理。「' + text + '」功能正在开发中，原型阶段暂展示核心流程。');
  }, 500);
}

function pushMapCard() {
  const d = role === 'gm' ? data.regions.east : [];
  const territoryName = data.territory;
  const pins = data.mapPins || [];

  addCard(`
    <div style="font-weight:700;font-size:12px;margin-bottom:6px">🗺️ ${role === 'gm' ? '华东大区 · ' + territoryName : territoryName} 作战态势</div>
    <div style="background:var(--bg-card);border-radius:8px;padding:14px;text-align:center;border:1px solid var(--border-glass);margin-bottom:6px">
      <div style="font-size:32px;margin-bottom:6px">🗺️</div>
      <div style="font-size:10px;color:var(--text-muted)">Sales ${role === 'gm' ? '6' : '8'}人 · 客户 24 家 · 标讯 5 条 · 竞品 3 个</div>
      <div style="font-size:10px;color:var(--text-muted);margin-top:2px">${pins.filter(p => p.status === 'risk').length} 个风险客户 · ${pins.filter(p => p.highValue).length} 条高价值标讯</div>
    </div>
    ${role === 'gm' ? '<div style="font-size:10px;color:var(--accent)">点击可下钻查看战区详情 →</div>' : ''}
  `);
}

function pushBidCard() {
  const bids = data.bids;
  addCard(`
    <div style="font-weight:700;font-size:12px;margin-bottom:6px">📡 标讯看板</div>
    <div style="font-size:10px;font-weight:600;color:var(--success);margin-bottom:4px">🎯 意向标讯（${bids.intended.length}）</div>
    ${bids.intended.map(b => `
      <div style="font-size:10px;padding:4px 0;border-bottom:1px solid var(--border-subtle);display:flex;justify-content:space-between">
        <span>${b.highValue ? '⭐' : ''} ${b.name}</span>
        <span class="mono" style="color:var(--text-muted)">${fmtK(b.amount)} · ${b.deadline}</span>
      </div>
    `).join('')}
    <div style="font-size:10px;font-weight:600;color:var(--warning);margin:6px 0 4px">📢 公开标讯（${bids.public.length}）</div>
    ${bids.public.map(b => `
      <div style="font-size:10px;padding:4px 0;border-bottom:1px solid var(--border-subtle);display:flex;justify-content:space-between">
        <span>${b.name}</span>
        <span style="color:${b.status === 'reported' ? 'var(--success)' : 'var(--danger)'}">${b.status === 'reported' ? '✅ 已提报' : '⚠ 待反馈'}</span>
      </div>
    `).join('')}
  `);
}

// ═══════ GREETING ═══════
function runGreeting() {
  if (role === 'ar') sim.run('greeting_ar');
  else sim.run('greeting_gm');
}

// ═══════ EVENTS ═══════
function bindEvents() {
  $('#roleToggle').addEventListener('click', () => {
    role = role === 'ar' ? 'gm' : 'ar';
    data = getData(role);
    updateUI();
    sim = new AgentSimulator(addMsg, handleAction);
    $('#chatArea').innerHTML = '';
    addMsg(`已切换到 <b>${role === 'gm' ? '战区总经理' : 'AR Sales'}</b> 视角`);
    setTimeout(() => runGreeting(), 600);
  });

  $$('.quick-btn').forEach(b => {
    b.addEventListener('click', () => {
      const action = b.dataset.action;
      const actions = {
        dashboard: '展开作战看板',
        map: '看看地图',
        bid: '查看标讯',
        coach: '教练建议',
        visit: '我要报拜访',
      };
      if (actions[action]) handleUserAction(actions[action]);
    });
  });
}

init();
