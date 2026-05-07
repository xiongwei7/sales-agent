// ╔══════════════════════════════════════════╗
// ║  Agent Simulator — 对话模拟引擎        ║
// ╚══════════════════════════════════════════╝

export class AgentSimulator {
  constructor(onMessage, onAction) {
    this.onMessage = onMessage;
    this.onAction = onAction;
  }

  run(name, data = {}) {
    const scenario = this.scenarios[name];
    if (!scenario) return;
    scenario.forEach((step, i) => {
      setTimeout(() => {
        if (step.msg && this.onMessage) this.onMessage(step.msg);
        if (step.action && this.onAction) this.onAction(step.action, data);
      }, step.delay);
    });
  }

  get scenarios() {
    return {
      greeting_ar: [
        { delay: 400,  msg: '早上好，张三！☀️<br>你的今日作战概览已就绪。' },
        { delay: 1200, action: 'push_metrics' },
        { delay: 2000, msg: '你有 <span style="color:#f53b57">2 个差距</span>需关注：REV 达成落后，高价值客户缺口 3 家。' },
        { delay: 3000, action: 'push_gap' },
        { delay: 4000, msg: '建议优先跟进海光战核客户A，预计可贡献 ¥200K。<br>需要我帮你生成拜访计划吗？' },
      ],
      greeting_gm: [
        { delay: 400,  msg: '早上好，王指挥！👔<br>你的团队作战概览已就绪。' },
        { delay: 1200, action: 'push_metrics' },
        { delay: 2000, msg: '⚠️ <span style="color:#f53b57">王五、钱七</span>达成率持续落后，需要管理干预。' },
        { delay: 3000, action: 'push_gap' },
        { delay: 4000, msg: '已为你列出管理建议：绩效面谈、过程抽检、新人带教。<br>需要我帮你安排吗？' },
      ],
      trigger_plan: [
        { delay: 500,  msg: '收到。正在调用 <b>作战计划Agent</b>...' },
        { delay: 1800, msg: '✅ 已生成本周重点拜访计划：<br><br>📅 <b>周二</b> 某银行总行 — 方案演示<br>📅 <b>周三</b> 某证券公司 — 商务谈判<br>📅 <b>周四</b> 某保险公司 — 回款跟进<br><br>已同步到你的日程。' },
      ],
      trigger_coach: [
        { delay: 500,  msg: '🎓 <b>教练Agent</b> 诊断中...' },
        { delay: 1500, msg: '你在<b>客户异议处理</b>方面存在提升空间。系统检索到王五的相似场景优秀案例，建议先学习再模拟陪练。' },
        { delay: 3000, action: 'push_case_card' },
      ],
      trigger_manage: [
        { delay: 500,  msg: '收到。正在为你安排管理动作...' },
        { delay: 1500, msg: '✅ 已添加 <b>王五绩效面谈</b> 到本周四 10:30<br>✅ 已标记 <b>钱七拜访记录</b> 待抽检<br>✅ 已通知 <b>孙八</b> 负责赵六新人带教' },
      ],
    };
  }
}
