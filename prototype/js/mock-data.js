// ╔══════════════════════════════════════════╗
// ║  Mock Data — AR Sales + 战区总经理      ║
// ╚══════════════════════════════════════════╝

const NOW = new Date();

function daysFromNow(n) {
  const d = new Date(NOW);
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export const AR_SALES = {
  name: '张三',
  role: 'ar',
  region: '华东大区',
  territory: '上海战区',
  industries: ['金融'],
  targets: {
    rev:    { target: 2800, achieved: 1064, unit: 'K', rank: '5/12', trend: -1 },
    ca:     { target: 1700, achieved: 884,  unit: 'K', rank: '3/12', trend: 1 },
    compA:  { target: 100,  achieved: 65,   unit: '%', rank: '6/12', trend: 0 },
    compB:  { target: 100,  achieved: 80,   unit: '%', rank: '2/12', trend: 1 },
  },
  customers: [
    { name: '某银行总行', rev: 320, yoy: 12, status: 'good',     lastVisit: daysFromNow(-4),  oppStage: '方案阶段', contract: '执行中' },
    { name: '某证券公司', rev: 180, yoy: -8, status: 'stalled',  lastVisit: daysFromNow(-16), oppStage: '商务谈判', contract: '待续约' },
    { name: '某保险公司', rev: 95,  yoy: 0,  status: 'risk',     lastVisit: daysFromNow(-21), oppStage: '停滞',     contract: '回款延迟' },
    { name: '某信托公司', rev: 150, yoy: 5,  status: 'good',     lastVisit: daysFromNow(-5),  oppStage: '招标中',   contract: '执行中' },
    { name: '某基金公司', rev: 80,  yoy: 15, status: 'good',     lastVisit: daysFromNow(-8),  oppStage: '需求确认', contract: '新签' },
    { name: '某租赁公司', rev: 120, yoy: -3, status: 'stalled',  lastVisit: daysFromNow(-12), oppStage: '初步接触', contract: '待启动' },
    { name: '某消费金融', rev: 60,  yoy: 20, status: 'good',     lastVisit: daysFromNow(-3),  oppStage: '合同签署', contract: '即将签署' },
    { name: '某支付公司', rev: 200, yoy: 8,  status: 'good',     lastVisit: daysFromNow(-6),  oppStage: '方案演示', contract: '执行中' },
  ],
  strategicTasks: {
    highValue:  { label: '高价值客户经营', done: 3, total: 6 },
    strategic:   { label: '海光战核客户经营', done: 2, total: 4 },
    campaign:    { label: '重点战役', done: 1, total: 3 },
    visits:      { label: '客户拜访', done: 12, total: 20 },
  },
  bids: {
    intended: [
      { name: '某银行核心系统采购项目',  amount: 800, deadline: daysFromNow(6),  highValue: true,  industry: '金融' },
      { name: '某证券数据平台建设',      amount: 500, deadline: daysFromNow(19), highValue: true,  industry: '金融' },
      { name: '某保险灾备项目',          amount: 300, deadline: daysFromNow(26), highValue: false, industry: '金融' },
    ],
    public: [
      { name: '某医院HIS系统招标',   deadline: daysFromNow(0),  highValue: true,  status: 'reported' },
      { name: '某高校信息化平台',     deadline: daysFromNow(9),  highValue: false, status: 'pending' },
      { name: '某政府部门安全项目',   deadline: daysFromNow(14), highValue: false, status: 'pending' },
    ],
  },
  actions: [
    { type: 'visit',   time: '10:00', content: '拜访某银行总行 — 方案演示', priority: 2 },
    { type: 'bid',     time: '14:00', content: '标讯：某医院HIS系统今日截止', priority: 3 },
    { type: 'meeting', time: '16:00', content: '上海战区周会 — 目标复盘', priority: 1 },
    { type: 'task',    time: '全天',  content: '更新8家客户经营记录到CRM', priority: 1 },
  ],
  agentFeed: [
    { from: '跟进Agent', msg: '某保险公司回款已延迟 14 天，建议今天联系财务确认', type: 'warning' },
    { from: '教练Agent', msg: '某银行总行拜访获评优秀案例，已沉淀到知识库', type: 'success' },
    { from: '洞察Agent', msg: '金融行业新增 1 条高价值意向标讯，3 天后截止', type: 'info' },
    { from: '教练Agent', msg: '你在客户异议处理方面有提升空间，建议模拟陪练', type: 'warning' },
  ],
  // Map pins for territory view
  mapPins: [
    { type: 'sales', name: '张三', rev: 65, x: 62, y: 28 },
    { type: 'sales', name: '同事A', rev: 52, x: 35, y: 48 },
    { type: 'sales', name: '同事B', rev: 38, x: 72, y: 55 },
    { type: 'customer', name: '某银行总行', status: 'good', x: 58, y: 22 },
    { type: 'customer', name: '某证券公司', status: 'stalled', x: 28, y: 38 },
    { type: 'customer', name: '某保险公司', status: 'risk', x: 45, y: 62 },
    { type: 'bid', name: '某医院招标', highValue: true, deadline: daysFromNow(0), x: 70, y: 45 },
    { type: 'competitor', name: '竞品X公司', x: 40, y: 18 },
    { type: 'partner', name: '渠道伙伴P', x: 68, y: 68 },
  ],
};

export const GM = {
  name: '王指挥',
  role: 'gm',
  region: '华东大区',
  territory: '浙江战区',
  industries: ['金融', '制造'],
  targets: {
    rev: { target: 18000, achieved: 7560, unit: 'K', rank: '1/6', trend: 1 },
    ca:  { target: 12000, achieved: 6600, unit: 'K', rank: '2/6', trend: 1 },
  },
  members: [
    { name: '张三', rev: 65, ca: 58, status: 'good' },
    { name: '李四', rev: 52, ca: 60, status: 'good' },
    { name: '王五', rev: 28, ca: 35, status: 'risk' },
    { name: '赵六', rev: 25, ca: 30, status: 'risk' },
    { name: '钱七', rev: 18, ca: 22, status: 'critical' },
    { name: '孙八', rev: 48, ca: 55, status: 'good' },
  ],
  regions: {
    national: [
      { name: '华东大区', rev: 48, rank: 1, territories: 6, isMine: true },
      { name: '华南大区', rev: 42, rank: 2, territories: 5, isMine: false },
      { name: '华北大区', rev: 40, rank: 3, territories: 5, isMine: false },
      { name: '西南大区', rev: 35, rank: 4, territories: 4, isMine: false },
      { name: '西北大区', rev: 30, rank: 5, territories: 3, isMine: false },
      { name: '华中大区', rev: 28, rank: 6, territories: 4, isMine: false },
    ],
    east: [
      { name: '上海战区', rev: 52, rank: 1, sales: 8, customers: 32, isMine: false },
      { name: '江苏战区', rev: 45, rank: 2, sales: 7, customers: 28, isMine: false },
      { name: '浙江战区', rev: 42, rank: 3, sales: 6, customers: 24, isMine: true },
      { name: '安徽战区', rev: 38, rank: 4, sales: 5, customers: 18, isMine: false },
      { name: '福建战区', rev: 35, rank: 5, sales: 4, customers: 15, isMine: false },
      { name: '江西战区', rev: 30, rank: 6, sales: 3, customers: 12, isMine: false },
    ],
  },
  mapPins: [
    { type: 'sales', name: '张三', rev: 65, x: 55, y: 20 },
    { type: 'sales', name: '李四', rev: 52, x: 30, y: 45 },
    { type: 'sales', name: '王五', rev: 28, x: 48, y: 62 },
    { type: 'customer', name: '客户A', status: 'good', x: 60, y: 30 },
    { type: 'customer', name: '客户B', status: 'risk', x: 25, y: 60 },
    { type: 'bid', name: '标讯X项目', highValue: true, x: 75, y: 40 },
    { type: 'competitor', name: '竞品Y', x: 45, y: 15 },
    { type: 'partner', name: '伙伴Z', x: 60, y: 70 },
  ],
  // GM has more agent feed
  agentFeed: [
    { from: '跟进Agent', msg: '王五 REV 达成仅 28%，已连续 2 周落后，建议绩效面谈', type: 'danger' },
    { from: '跟进Agent', msg: '钱七拜访量仅达标 40%，需过程抽检', type: 'warning' },
    { from: '洞察Agent', msg: '华东大区今日新增 3 条高价值标讯待分配', type: 'info' },
    { from: '教练Agent', msg: '赵六作为新人，建议本周安排带教计划', type: 'info' },
  ],
};

export function getData(role) {
  return role === 'gm' ? GM : AR_SALES;
}
