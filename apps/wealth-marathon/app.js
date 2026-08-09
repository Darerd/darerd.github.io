const presets = {
  starter: { income: 12, assets: 5, debt: 0, debtPay: 0, expense: 8, returnRate: 5 },
  builder: { income: 40, assets: 200, debt: 40, debtPay: 5, expense: 24, returnRate: 5 },
  earner: { income: 200, assets: 30, debt: 0, debtPay: 0, expense: 90, returnRate: 5 },
  debt: { income: 50, assets: 30, debt: 100, debtPay: 12, expense: 25, returnRate: 5 }
};

const stageCopy = [
  {
    name: "本金建立",
    next: "提高收入，并留下钱",
    explain: "当前最重要的不是追热点，而是提高收入、控制支出，并稳定攒下第一桶本金。",
    advice: [
      ["优先投资自己", "提高职业能力带来的现金流增量，通常大于小本金上的投资收益。"],
      ["建立安全垫", "先准备 6 到 12 个月生活费，再逐步配置低波动资产。"],
      ["降低复杂度", "存款、货币基金、国债和少量宽基，比频繁交易更适合起步。"]
    ]
  },
  {
    name: "资产积累",
    next: "从存钱转向资产配置",
    explain: "资产收益已经开始有存在感，需要让现金、债券、宽基、红利和黄金承担不同角色。",
    advice: [
      ["建立组合", "把资产分成流动性、防守、增长、现金流和分散风险几个部分。"],
      ["控制单点风险", "不要让一类资产决定整个家庭的财富曲线。"],
      ["长期再平衡", "定期检查比例，少追热点，多维护组合。"]
    ]
  },
  {
    name: "资产增长",
    next: "让资产成为第二份收入",
    explain: "资产收益开始接近或超过年度新增储蓄，财富增长进入劳动和资产共同驱动阶段。",
    advice: [
      ["关注复利", "比起短期胜率，更重要的是资产能否长期留在系统里滚动。"],
      ["扩大全球视野", "宽基、QDII、REITs 和优质企业可以承担增长角色。"],
      ["保留体力", "资产越大，回撤越疼，现金和债券仍然有意义。"]
    ]
  },
  {
    name: "财富管理",
    next: "从追收益转向控回撤",
    explain: "本金规模变大后，风险管理的重要性开始超过追求极致收益。",
    advice: [
      ["控制最大回撤", "先问亏损 20% 到 30% 是否会影响生活和判断。"],
      ["重视现金流", "用股债、黄金、现金流资产共同降低波动。"],
      ["减少赌性", "财富越多，越没有必要靠一次重仓证明自己。"]
    ]
  },
  {
    name: "财富保全",
    next: "让现金流覆盖长期生活",
    explain: "目标从赚更多转为让财富几十年后依然存在，并稳定支持生活选择。",
    advice: [
      ["现金流优先", "资产现金流应逐步覆盖家庭长期支出。"],
      ["全球配置", "分散单一市场、单一货币和单一资产类型风险。"],
      ["制度化管理", "用规则替代情绪，让家庭资产长期可持续。"]
    ]
  }
];

const ids = ["income", "assets", "debt", "debtPay", "expense", "returnRate"];
const els = Object.fromEntries(ids.map(id => [id, document.getElementById(id)]));

const fmt = value => `${Number(value).toFixed(value % 1 ? 1 : 0)} 万`;
const pct = value => `${Math.round(value)}%`;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const svgNS = "http://www.w3.org/2000/svg";

function getValues() {
  return Object.fromEntries(ids.map(id => [id, Number(els[id].value)]));
}

function pickStage(v, assetIncome, surplus, freedomRatio, debtPressure) {
  if (freedomRatio >= 100 || v.assets >= 3000) return 4;
  if (v.assets >= 1000 || assetIncome >= v.income * 0.5) return 3;
  if (v.assets >= 500 || assetIncome >= surplus) return 2;
  if (v.assets >= 100 || assetIncome >= 8) return 1;
  if (debtPressure > 35 && v.assets < 100) return 0;
  return 0;
}

function riskLabel(debtPressure, safetyRatio) {
  if (debtPressure >= 35 || safetyRatio < 10) return ["风险边界：偏紧", "var(--rose)"];
  if (debtPressure >= 20 || safetyRatio < 25) return ["风险边界：谨慎", "var(--amber)"];
  return ["风险边界：稳健", "var(--teal)"];
}

function scenarioRates(stageIndex, debtPressure, safetyRatio) {
  const incomeGrowth = [0.06, 0.045, 0.035, 0.02, 0.01][stageIndex];
  const expenseGrowth = debtPressure > 30 ? 0.035 : 0.025;
  const investRatio = safetyRatio > 35 ? 0.72 : safetyRatio > 18 ? 0.58 : 0.35;
  return { incomeGrowth, expenseGrowth, investRatio };
}

function projectSeries(v, surplus, stageIndex, debtPressure, safetyRatio) {
  const { incomeGrowth, expenseGrowth, investRatio } = scenarioRates(stageIndex, debtPressure, safetyRatio);
  const rows = [];
  let income = v.income;
  let expense = v.expense + v.debtPay;
  let assets = v.assets;

  for (let year = 0; year <= 20; year += 1) {
    const assetIncome = assets * v.returnRate / 100;
    rows.push({ year, income, expense, assetIncome, assets });
    const annualSurplus = Math.max(0, income - expense);
    assets += annualSurplus * investRatio + assetIncome;
    income *= 1 + incomeGrowth;
    expense *= 1 + expenseGrowth;
  }

  if (surplus < 0) {
    rows.forEach((row, index) => {
      row.expense *= 1 + Math.min(0.25, index * 0.01);
    });
  }

  return rows;
}

function svgEl(name, attrs = {}) {
  const node = document.createElementNS(svgNS, name);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  return node;
}

function linePath(rows, x, y, key) {
  return rows.map((row, index) => `${index ? "L" : "M"} ${x(row.year).toFixed(1)} ${y(row[key]).toFixed(1)}`).join(" ");
}

function renderProjection(v, surplus, stageIndex, debtPressure, safetyRatio) {
  const svg = document.getElementById("projectionChart");
  svg.replaceChildren();

  const rows = projectSeries(v, surplus, stageIndex, debtPressure, safetyRatio);
  const width = 620;
  const height = 340;
  const margin = { top: 28, right: 26, bottom: 44, left: 52 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;
  const maxValue = Math.max(...rows.flatMap(row => [row.income, row.expense, row.assetIncome]), 10);
  const yMax = Math.ceil(maxValue / 20) * 20;
  const x = year => margin.left + year / 20 * plotW;
  const y = value => margin.top + (1 - value / yMax) * plotH;
  const tickValues = [0, Math.round(yMax / 2), yMax];

  tickValues.forEach(value => {
    svg.appendChild(svgEl("line", { x1: margin.left, y1: y(value), x2: width - margin.right, y2: y(value), class: "chart-grid" }));
    svg.appendChild(svgEl("text", { x: 14, y: y(value) + 4, class: "chart-label" })).textContent = `${value}万`;
  });

  [0, 5, 10, 15, 20].forEach(year => {
    svg.appendChild(svgEl("text", { x: x(year), y: height - 14, "text-anchor": "middle", class: "chart-label" })).textContent = `${year}年`;
  });

  svg.appendChild(svgEl("line", { x1: margin.left, y1: margin.top, x2: margin.left, y2: height - margin.bottom, class: "chart-axis" }));
  svg.appendChild(svgEl("line", { x1: margin.left, y1: height - margin.bottom, x2: width - margin.right, y2: height - margin.bottom, class: "chart-axis" }));

  const futureRows = rows.slice(0);
  [
    ["income", "chart-income"],
    ["expense", "chart-expense"],
    ["assetIncome", "chart-asset"]
  ].forEach(([key, cls]) => {
    svg.appendChild(svgEl("path", { d: linePath(futureRows, x, y, key), class: `chart-line is-future ${cls}` }));
  });

  const current = rows[0];
  [
    ["income", "chart-income"],
    ["expense", "chart-expense"],
    ["assetIncome", "chart-asset"]
  ].forEach(([key, cls]) => {
    svg.appendChild(svgEl("circle", { cx: x(0), cy: y(current[key]), r: 6, class: `current-node ${cls}` }));
  });

  svg.appendChild(svgEl("text", { x: x(0) + 12, y: y(current.income) - 12, class: "current-label" })).textContent = "当前节点";

  const freedomYear = rows.find(row => row.assetIncome >= row.expense);
  if (freedomYear) {
    const mx = x(freedomYear.year);
    svg.appendChild(svgEl("line", { x1: mx, y1: margin.top, x2: mx, y2: height - margin.bottom, class: "milestone-line" }));
    svg.appendChild(svgEl("text", { x: Math.min(mx + 8, width - 126), y: margin.top + 16, class: "milestone-label" })).textContent = `约第 ${freedomYear.year} 年覆盖生活`;
  } else {
    svg.appendChild(svgEl("text", { x: width - 196, y: margin.top + 16, class: "milestone-label" })).textContent = "20 年内仍需劳动收入接力";
  }
}

function updateOutputs(v) {
  document.getElementById("incomeOut").value = v.income;
  document.getElementById("assetsOut").value = v.assets;
  document.getElementById("debtOut").value = v.debt;
  document.getElementById("debtPayOut").value = v.debtPay;
  document.getElementById("expenseOut").value = v.expense;
  document.getElementById("returnOut").value = v.returnRate;
}

function render() {
  const v = getValues();
  updateOutputs(v);

  const assetIncome = v.assets * v.returnRate / 100;
  const surplus = v.income - v.expense - v.debtPay;
  const freedomRatio = v.expense > 0 ? assetIncome / v.expense * 100 : 0;
  const debtPressure = v.income > 0 ? v.debtPay / v.income * 100 : 0;
  const safetyRatio = v.income > 0 ? Math.max(0, surplus) / v.income * 100 : 0;
  const stageIndex = pickStage(v, assetIncome, surplus, freedomRatio, debtPressure);
  const stage = stageCopy[stageIndex];

  document.getElementById("stageName").textContent = stage.name;
  document.getElementById("surplus").textContent = fmt(surplus);
  document.getElementById("assetIncome").textContent = fmt(assetIncome);
  document.getElementById("freedomRatio").textContent = pct(freedomRatio);
  document.getElementById("nextKm").textContent = stage.next;
  document.getElementById("stageExplain").textContent = stage.explain;
  document.getElementById("engineText").textContent = assetIncome >= Math.max(surplus, 1)
    ? "资产收益正在成为主引擎"
    : "劳动收入仍是主引擎";

  document.getElementById("flowIncome").textContent = fmt(v.income);
  document.getElementById("flowSurplus").textContent = fmt(surplus);
  document.getElementById("flowAssets").textContent = fmt(v.assets);
  document.getElementById("flowIncomeAsset").textContent = fmt(assetIncome);
  document.getElementById("debtPressure").textContent = pct(debtPressure);
  document.getElementById("safetyRatio").textContent = pct(safetyRatio);

  const [riskText, riskColor] = riskLabel(debtPressure, safetyRatio);
  const riskBadge = document.getElementById("riskBadge");
  riskBadge.textContent = riskText;
  riskBadge.style.color = riskColor;

  const assetScore = clamp(Math.log10(v.assets + 1) / Math.log10(3001) * 100, 12, 88);
  const cashScore = clamp(100 - debtPressure * 1.8 + safetyRatio * 0.45, 12, 88);
  const mapDot = document.getElementById("mapDot");
  mapDot.style.left = `${clamp(assetScore, 14, 86)}%`;
  mapDot.style.top = `${clamp(100 - cashScore, 14, 86)}%`;
  mapDot.style.borderColor = riskColor;

  renderProjection(v, surplus, stageIndex, debtPressure, safetyRatio);

  const debtBar = document.getElementById("debtBar");
  debtBar.style.width = `${clamp(debtPressure, 0, 100)}%`;
  debtBar.style.background = debtPressure >= 35 ? "var(--rose)" : debtPressure >= 20 ? "var(--amber)" : "var(--teal)";
  document.getElementById("safetyBar").style.width = `${clamp(safetyRatio, 0, 100)}%`;

  document.getElementById("adviceList").innerHTML = stage.advice.map(([title, text]) => (
    `<article class="advice"><b>${title}</b><p>${text}</p></article>`
  )).join("");
}

function applyPreset(name) {
  const preset = presets[name];
  if (!preset) return;
  for (const [key, value] of Object.entries(preset)) {
    els[key].value = value;
  }
  document.querySelectorAll(".preset").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.preset === name);
  });
  render();
}

ids.forEach(id => els[id].addEventListener("input", () => {
  document.querySelectorAll(".preset").forEach(btn => btn.classList.remove("active"));
  render();
}));

document.querySelectorAll(".preset").forEach(btn => {
  btn.addEventListener("click", () => applyPreset(btn.dataset.preset));
});

document.getElementById("resetBtn").addEventListener("click", () => applyPreset("starter"));

render();
