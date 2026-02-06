/* ============================================
   vidIQ Partner Dashboard — App Logic (v4)
   Timeframe-aware filtering
   ============================================ */

// ---------- Active partner ----------
let PARTNER = null;

// Current timeframe state
let currentTimeframe = { range: 'all', from: null, to: null };

// ---------- Fallback partner ----------
function buildDefaultPartner() {
  const slug = new URLSearchParams(window.location.search).get('partner') || 'yourivanhofwegen';
  return {
    name: slug.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, s => s.toUpperCase()),
    initials: slug.substring(0, 2).toUpperCase(),
    slug: slug,
    url: 'vidiq.com/' + slug,
    baseUrl: 'https://vidiq.com/' + slug,
    kpi: {
      totalEarnings: { value: '$—', change: '—', direction: 'up' },
      thisMonth: { value: '$—', change: '—', direction: 'up' },
      activeSubs: { value: '—', change: '—', direction: 'up' },
      newSignups: { value: '—', change: '—', direction: 'up' },
      conversionRate: { value: '—', change: '—', direction: 'up' },
      churnRate: { value: '—', change: '—', direction: 'down' },
    },
    MONTHS: [], EARNINGS_DATA: [], NEW_REV: [], RECURRING_REV: [],
    FUNNEL_DATA: [], TOP_CONTENT: [], LINK_TABLE: [],
    CUSTOMER_BREAKDOWN: [], RECENT_CONVERSIONS: [],
  };
}

// ---------- Theme ----------
function initTheme() {
  const saved = localStorage.getItem('vidiq-theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('vidiq-theme', next);
  updateThemeIcon(next);
  if (typeof renderAllDashboard === 'function') renderAllDashboard();
}

function updateThemeIcon(theme) {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  btn.innerHTML = theme === 'dark'
    ? '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
    : '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
}

// ---------- Mobile Sidebar ----------
function toggleSidebar() {
  document.querySelector('.sidebar').classList.toggle('open');
}

// ---------- Toast ----------
function showToast(message, duration = 2500) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// ---------- Chart Helpers ----------
function getThemeColors() {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  return {
    gridColor: dark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.06)',
    textColor: dark ? '#9CA3AF' : '#6B7280',
    tooltipBg: dark ? '#1A1D23' : '#fff',
    tooltipText: dark ? '#F3F4F6' : '#1A1D23',
    tooltipBorder: dark ? '#2A2D35' : '#E8EBF0',
  };
}

function chartDefaults() {
  const t = getThemeColors();
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: t.textColor, font: { size: 12, weight: '600', family: "'Inter', sans-serif" }, padding: 16, usePointStyle: true, pointStyleWidth: 8 }
      },
      tooltip: {
        backgroundColor: t.tooltipBg,
        titleColor: t.tooltipText,
        bodyColor: t.tooltipText,
        borderColor: t.tooltipBorder,
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        titleFont: { weight: '700', family: "'Inter', sans-serif" },
        bodyFont: { family: "'Inter', sans-serif" },
        displayColors: true,
        boxPadding: 4,
      }
    },
    scales: {
      x: { ticks: { color: t.textColor, font: { size: 11 } }, grid: { color: t.gridColor } },
      y: { ticks: { color: t.textColor, font: { size: 11 } }, grid: { color: t.gridColor } },
    }
  };
}

// ============================================================
//  TIMEFRAME FILTERING ENGINE
// ============================================================

function hasDailyData() {
  return PARTNER && Array.isArray(PARTNER.DAILY_DATA) && PARTNER.DAILY_DATA.length > 0;
}

function getDateRange() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let from, to;

  switch (currentTimeframe.range) {
    case '7d':
      to = today;
      from = new Date(today);
      from.setDate(from.getDate() - 6);
      break;
    case '30d':
      to = today;
      from = new Date(today);
      from.setDate(from.getDate() - 29);
      break;
    case '3m':
      to = today;
      from = new Date(today);
      from.setMonth(from.getMonth() - 3);
      break;
    case '6m':
      to = today;
      from = new Date(today);
      from.setMonth(from.getMonth() - 6);
      break;
    case '12m':
      to = today;
      from = new Date(today);
      from.setFullYear(from.getFullYear() - 1);
      break;
    case 'custom':
      from = currentTimeframe.from ? new Date(currentTimeframe.from + 'T00:00:00') : null;
      to = currentTimeframe.to ? new Date(currentTimeframe.to + 'T00:00:00') : null;
      if (!from || !to) return null;
      break;
    case 'all':
    default:
      return null; // null means no filter
  }
  return { from, to };
}

function filterDailyData() {
  if (!hasDailyData()) return null;
  const range = getDateRange();
  if (!range) return PARTNER.DAILY_DATA; // all data
  return PARTNER.DAILY_DATA.filter(d => {
    const dt = new Date(d.date + 'T00:00:00');
    return dt >= range.from && dt <= range.to;
  });
}

// Aggregate daily data into buckets (day, week, month) based on range size
function aggregateForChart(dailyData) {
  if (!dailyData || dailyData.length === 0) return { labels: [], payouts: [], revenues: [] };

  const days = dailyData.length;
  let mode = 'day';
  if (days > 90) mode = 'month';
  else if (days > 31) mode = 'week';

  const buckets = {};

  dailyData.forEach(d => {
    let key;
    if (mode === 'day') {
      key = d.date; // YYYY-MM-DD
    } else if (mode === 'week') {
      // Week starting Monday
      const dt = new Date(d.date + 'T00:00:00');
      const day = dt.getDay();
      const diff = dt.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(dt);
      monday.setDate(diff);
      key = 'W ' + monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      key = d.date.substring(0, 7); // YYYY-MM
    }

    if (!buckets[key]) buckets[key] = { payout: 0, revenue: 0, clicks: 0, conversions: 0 };
    buckets[key].payout += d.payout;
    buckets[key].revenue += d.revenue;
    buckets[key].clicks += d.clicks;
    buckets[key].conversions += d.conversions;
  });

  // Sort keys
  const sortedKeys = Object.keys(buckets);
  if (mode === 'day') {
    sortedKeys.sort();
  } else if (mode === 'month') {
    sortedKeys.sort();
  }
  // Week keys are already in order from the sorted daily data

  // Format labels nicely
  const labels = sortedKeys.map(k => {
    if (mode === 'day') {
      const dt = new Date(k + 'T00:00:00');
      return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (mode === 'month') {
      const parts = k.split('-');
      const dt = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
      return dt.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    }
    return k;
  });

  return {
    labels,
    payouts: sortedKeys.map(k => Math.round(buckets[k].payout * 100) / 100),
    revenues: sortedKeys.map(k => Math.round(buckets[k].revenue * 100) / 100),
    clicks: sortedKeys.map(k => buckets[k].clicks),
    conversions: sortedKeys.map(k => buckets[k].conversions),
  };
}

function computeFilteredTotals(dailyData) {
  if (!dailyData || dailyData.length === 0) {
    return { clicks: 0, conversions: 0, payout: 0, revenue: 0, days: 0 };
  }
  const totals = { clicks: 0, conversions: 0, payout: 0, revenue: 0, days: dailyData.length };
  dailyData.forEach(d => {
    totals.clicks += d.clicks;
    totals.conversions += d.conversions;
    totals.payout += d.payout;
    totals.revenue += d.revenue;
  });
  return totals;
}

// ============================================================
//  TIMEFRAME UI
// ============================================================

function initTimeframeUI() {
  const bar = document.getElementById('timeframeBar');
  if (!bar) return;

  // Show/hide based on whether we're on the dashboard page
  if (!document.getElementById('earningsChart')) {
    bar.style.display = 'none';
    return;
  }

  // Setup pill clicks
  const pills = document.querySelectorAll('.tf-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      const range = pill.dataset.range;
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const customEl = document.getElementById('tfCustomRange');

      if (range === 'custom') {
        customEl.style.display = 'flex';
        // Don't apply yet — wait for Apply button
        return;
      } else {
        customEl.style.display = 'none';
      }

      currentTimeframe.range = range;
      currentTimeframe.from = null;
      currentTimeframe.to = null;
      applyTimeframe();
    });
  });

  // Apply button for custom range
  const applyBtn = document.getElementById('tfApplyBtn');
  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      const from = document.getElementById('tfDateFrom').value;
      const to = document.getElementById('tfDateTo').value;
      if (!from || !to) {
        showToast('Please select both start and end dates');
        return;
      }
      if (from > to) {
        showToast('Start date must be before end date');
        return;
      }
      currentTimeframe.range = 'custom';
      currentTimeframe.from = from;
      currentTimeframe.to = to;
      applyTimeframe();
    });
  }

  // Set date input bounds from daily data
  if (hasDailyData()) {
    const data = PARTNER.DAILY_DATA;
    const minDate = data[0].date;
    const maxDate = data[data.length - 1].date;
    const fromInput = document.getElementById('tfDateFrom');
    const toInput = document.getElementById('tfDateTo');
    if (fromInput) { fromInput.min = minDate; fromInput.max = maxDate; }
    if (toInput) { toInput.min = minDate; toInput.max = maxDate; }
  }

  // Show notice for partners without daily data
  const notice = document.getElementById('tfNotice');
  if (notice) {
    notice.style.display = hasDailyData() ? 'none' : 'flex';
  }

  // If no daily data, disable all pills except All
  if (!hasDailyData()) {
    pills.forEach(p => {
      if (p.dataset.range !== 'all') {
        p.style.opacity = '0.4';
        p.style.pointerEvents = 'none';
      }
    });
  }

  updateSummaryText();
}

function updateSummaryText() {
  const el = document.getElementById('tfSummaryText');
  if (!el) return;

  if (!hasDailyData()) {
    el.textContent = 'Showing aggregate data';
    return;
  }

  const filtered = filterDailyData();
  if (!filtered) return;

  const range = getDateRange();
  if (!range) {
    el.textContent = `${filtered.length} days · All data`;
  } else {
    const fromStr = range.from.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const toStr = range.to.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    el.textContent = `${filtered.length} days · ${fromStr} — ${toStr}`;
  }
}

function applyTimeframe() {
  updateSummaryText();
  renderAllDashboard();
}

// ============================================================
//  POPULATE HEADER & KPIs
// ============================================================

function populatePartnerUI() {
  if (!PARTNER) return;

  // Header: avatar initials
  const avatar = document.querySelector('.header-right .avatar');
  if (avatar) avatar.textContent = PARTNER.initials;

  // Header: partner name
  const nameEl = document.querySelector('.header-right > span');
  if (nameEl) nameEl.textContent = PARTNER.name;

  // Header: partner URL text
  const urlEl = document.querySelector('.partner-url');
  if (urlEl) {
    const textNodes = Array.from(urlEl.childNodes).filter(n => n.nodeType === Node.TEXT_NODE);
    textNodes.forEach(n => n.remove());
    urlEl.appendChild(document.createTextNode('\n        ' + PARTNER.url + '\n      '));
  }

  // Page title
  document.title = PARTNER.name + ' — vidIQ Partner Dashboard';

  // Sidebar nav: preserve partner param on links
  const slug = getPartnerSlug();
  document.querySelectorAll('.sidebar-nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && href !== '#' && !href.startsWith('http')) {
      const base = href.split('?')[0];
      a.setAttribute('href', base + '?partner=' + slug);
    }
  });

  renderKPIs();
}

function renderKPIs() {
  const kpiGrid = document.querySelector('.kpi-grid');
  if (!kpiGrid || !PARTNER) return;

  // If we have daily data and a filter is active, compute filtered KPIs
  if (hasDailyData()) {
    const filtered = filterDailyData();
    const totals = computeFilteredTotals(filtered);
    const isAll = currentTimeframe.range === 'all';

    // For "all time" mode, use the original static KPI (includes pre-daily-data history)
    if (isAll) {
      renderStaticKPIs(kpiGrid);
    } else {
      const convRate = totals.clicks > 0 ? ((totals.conversions / totals.clicks) * 100).toFixed(1) : '0';
      const avgDaily = totals.days > 0 ? (totals.payout / totals.days).toFixed(2) : '0';
      const rangeLabel = getTimeframeLabel();

      const filteredKPIs = [
        {
          label: 'Period Earnings',
          value: '$' + formatMoney(totals.payout),
          change: rangeLabel,
          direction: 'up',
          color: 'var(--green)',
        },
        {
          label: 'Period Revenue',
          value: '$' + formatMoney(totals.revenue),
          change: 'Generated for vidIQ',
          direction: 'up',
        },
        {
          label: 'Conversions',
          value: totals.conversions.toLocaleString(),
          change: rangeLabel,
          direction: 'up',
        },
        {
          label: 'Clicks',
          value: totals.clicks.toLocaleString(),
          change: rangeLabel,
          direction: 'up',
          color: 'var(--primary)',
        },
        {
          label: 'Conversion Rate',
          value: convRate + '%',
          change: 'Click → Conversion',
          direction: 'up',
        },
        {
          label: 'Avg Daily Earnings',
          value: '$' + avgDaily,
          change: totals.days + ' days in period',
          direction: 'up',
        },
      ];

      kpiGrid.innerHTML = filteredKPIs.map(k => {
        const colorStyle = k.color ? ` style="color:${k.color}"` : '';
        return `<div class="kpi-card animate-in">
          <div class="kpi-label">${k.label}</div>
          <div class="kpi-value"${colorStyle}>${k.value}</div>
          <div class="kpi-change ${k.direction}">${k.change}</div>
        </div>`;
      }).join('');
    }
  } else {
    renderStaticKPIs(kpiGrid);
  }
}

function renderStaticKPIs(kpiGrid) {
  if (!PARTNER.kpi) return;
  const kpiOrder = ['totalEarnings', 'thisMonth', 'activeSubs', 'newSignups', 'conversionRate', 'churnRate'];
  const kpiLabels = {
    totalEarnings: 'Total Earnings',
    thisMonth: 'This Month',
    activeSubs: 'Active Subscribers',
    newSignups: 'New Signups',
    conversionRate: 'Conversion Rate',
    churnRate: 'Churn Rate',
  };
  kpiGrid.innerHTML = kpiOrder.map(key => {
    const k = PARTNER.kpi[key];
    if (!k) return '';
    const colorStyle = k.color ? ` style="color:${k.color}"` : '';
    return `<div class="kpi-card animate-in">
      <div class="kpi-label">${kpiLabels[key]}</div>
      <div class="kpi-value"${colorStyle}>${k.value}</div>
      <div class="kpi-change ${k.direction}">${k.change}</div>
    </div>`;
  }).join('');
}

function formatMoney(val) {
  if (val >= 1000) {
    const parts = val.toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts[0] + '<span style="font-size:16px">.' + parts[1] + '</span>';
  }
  return val.toFixed(2);
}

function getTimeframeLabel() {
  switch (currentTimeframe.range) {
    case '7d': return 'Last 7 days';
    case '30d': return 'Last 30 days';
    case '3m': return 'Last 3 months';
    case '6m': return 'Last 6 months';
    case '12m': return 'Last 12 months';
    case 'custom': return 'Custom range';
    case 'all':
    default: return 'All time';
  }
}

// ============================================================
//  RENDER CHARTS
// ============================================================

let chartInstances = {};

function renderCharts() {
  if (!PARTNER) return;

  // Destroy existing
  Object.values(chartInstances).forEach(c => c.destroy());
  chartInstances = {};

  const t = getThemeColors();

  // Determine data source
  let chartData;
  let useFiltered = hasDailyData() && currentTimeframe.range !== 'all';

  if (hasDailyData()) {
    const filtered = filterDailyData();
    chartData = aggregateForChart(filtered);
  }

  // 1. Earnings Over Time
  const ctx1 = document.getElementById('earningsChart');
  if (ctx1) {
    const defs = chartDefaults();
    const labels = useFiltered || hasDailyData() ? chartData.labels : PARTNER.MONTHS;
    const data = useFiltered || hasDailyData() ? chartData.payouts : PARTNER.EARNINGS_DATA;

    // Update chart subtitle
    const chartCard = ctx1.closest('.chart-card');
    if (chartCard) {
      const subtitle = chartCard.querySelector('h3 span');
      if (subtitle) {
        subtitle.textContent = hasDailyData() ? getTimeframeLabel() : 'Last 12 months';
      }
    }

    chartInstances.earnings = new Chart(ctx1.getContext('2d'), {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: hasDailyData() ? 'Payout ($)' : 'Monthly Earnings ($)',
          data: data,
          borderColor: '#00C853',
          backgroundColor: 'rgba(0,200,83,.08)',
          borderWidth: 2.5,
          fill: true,
          tension: .35,
          pointRadius: data.length > 60 ? 0 : data.length > 30 ? 2 : 4,
          pointBackgroundColor: '#00C853',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointHoverRadius: 6,
        }]
      },
      options: {
        ...defs,
        plugins: {
          ...defs.plugins,
          legend: { display: false },
          tooltip: {
            ...defs.plugins.tooltip,
            callbacks: {
              label: ctx => '$' + ctx.parsed.y.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}),
            }
          }
        },
        scales: {
          ...defs.scales,
          x: { ...defs.scales.x, ticks: { ...defs.scales.x.ticks, maxTicksLimit: 12, maxRotation: 45 } },
          y: { ...defs.scales.y, ticks: { ...defs.scales.y.ticks, callback: v => '$' + v.toLocaleString() } }
        }
      }
    });
  }

  // 2. New vs Recurring Revenue (or Payout vs Revenue for daily-data partners)
  const ctx2 = document.getElementById('revenueChart');
  if (ctx2) {
    const defs = chartDefaults();
    let labels, datasets;

    if (hasDailyData()) {
      labels = chartData.labels;
      const chartCard = ctx2.closest('.chart-card');
      if (chartCard) {
        const h3 = chartCard.querySelector('h3');
        const subtitle = h3.querySelector('span');
        // Update title text for daily data partners
        const titleText = h3.childNodes[0];
        if (titleText && titleText.nodeType === Node.TEXT_NODE) {
          titleText.textContent = 'Payout vs Revenue\n          ';
        }
        if (subtitle) subtitle.textContent = getTimeframeLabel();
      }
      datasets = [
        { label: 'Payout (Your Earnings)', data: chartData.payouts, backgroundColor: '#3B82F6', borderRadius: 4, barPercentage: .65 },
        { label: 'Revenue (vidIQ Total)', data: chartData.revenues, backgroundColor: '#00C853', borderRadius: 4, barPercentage: .65 },
      ];
    } else {
      labels = PARTNER.MONTHS;
      datasets = [
        { label: 'New Revenue', data: PARTNER.NEW_REV, backgroundColor: '#3B82F6', borderRadius: 4, barPercentage: .65 },
        { label: 'Recurring Revenue', data: PARTNER.RECURRING_REV, backgroundColor: '#00C853', borderRadius: 4, barPercentage: .65 },
      ];
    }

    chartInstances.revenue = new Chart(ctx2.getContext('2d'), {
      type: 'bar',
      data: { labels, datasets },
      options: {
        ...defs,
        plugins: {
          ...defs.plugins,
          tooltip: {
            ...defs.plugins.tooltip,
            callbacks: {
              label: ctx => ctx.dataset.label + ': $' + ctx.parsed.y.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}),
            }
          }
        },
        scales: {
          ...defs.scales,
          x: { ...defs.scales.x, stacked: !hasDailyData(), ticks: { ...defs.scales.x.ticks, maxTicksLimit: 12, maxRotation: 45 } },
          y: { ...defs.scales.y, stacked: !hasDailyData(), ticks: { ...defs.scales.y.ticks, callback: v => '$' + v.toLocaleString() } }
        }
      }
    });
  }

  // 3. Funnel
  renderFunnel();

  // 4. Top Converting Content
  const ctx4 = document.getElementById('contentChart');
  if (ctx4) {
    const defs = chartDefaults();
    const labels = PARTNER.TOP_CONTENT.map(d => d.name.length > 30 ? d.name.slice(0, 30) + '…' : d.name);
    chartInstances.content = new Chart(ctx4.getContext('2d'), {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Conversions',
          data: PARTNER.TOP_CONTENT.map(d => d.conversions),
          backgroundColor: PARTNER.TOP_CONTENT.map((_, i) => {
            const colors = ['#00C853','#00A344','#059669','#3B82F6','#8B5CF6','#F59E0B','#EF4444','#EC4899'];
            return colors[i % colors.length];
          }),
          borderRadius: 4,
          barPercentage: .7,
        }]
      },
      options: {
        ...defs,
        indexAxis: 'y',
        plugins: { ...defs.plugins, legend: { display: false } },
        scales: {
          x: { ...defs.scales.x },
          y: { ...defs.scales.y, ticks: { ...defs.scales.y.ticks, font: { size: 11 } }, grid: { display: false } },
        }
      }
    });
  }
}

function renderFunnel() {
  const el = document.getElementById('funnelContainer');
  if (!el || !PARTNER) return;

  let funnelData = PARTNER.FUNNEL_DATA;

  // If filtered and daily data available, build dynamic funnel
  if (hasDailyData() && currentTimeframe.range !== 'all') {
    const filtered = filterDailyData();
    const totals = computeFilteredTotals(filtered);
    funnelData = [
      { label: 'Clicks', value: totals.clicks, color: '#3B82F6' },
      { label: 'Conversions', value: totals.conversions, color: '#8B5CF6' },
      { label: 'Payout', value: Math.round(totals.payout), color: '#00C853' },
    ];
  }

  // Update funnel subtitle
  const chartCard = el.closest('.chart-card');
  if (chartCard) {
    const subtitle = chartCard.querySelector('h3 span');
    if (subtitle) {
      subtitle.textContent = hasDailyData() ? getTimeframeLabel() : 'All time';
    }
  }

  const max = funnelData[0]?.value || 1;
  el.innerHTML = funnelData.map((d, i) => {
    const pct = (d.value / max * 100).toFixed(1);
    const convRate = i === 0 ? '100%' : (d.value / funnelData[i - 1].value * 100).toFixed(1) + '%';
    const displayVal = d.label === 'Payout' ? '$' + d.value.toLocaleString() : d.value.toLocaleString();
    return `
      <div class="funnel-step animate-in" style="animation-delay:${i * .1}s">
        <span class="funnel-label">${d.label}</span>
        <div class="funnel-bar-wrap">
          <div class="funnel-bar" style="width:${pct}%;background:${d.color}">${displayVal}</div>
        </div>
        <span class="funnel-pct">${convRate}</span>
      </div>`;
  }).join('');
}

// ---------- Tables ----------
function renderLinkTable(sortKey = 'conversions', sortDir = 'desc') {
  const tbody = document.getElementById('linkTableBody');
  if (!tbody || !PARTNER) return;

  const sorted = [...PARTNER.LINK_TABLE].sort((a, b) => {
    const va = a[sortKey], vb = b[sortKey];
    if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    return sortDir === 'asc' ? va - vb : vb - va;
  });

  tbody.innerHTML = sorted.map(r => {
    const rate = ((r.conversions / r.clicks) * 100).toFixed(1);
    return `<tr>
      <td><strong>${r.name}</strong></td>
      <td><span class="badge badge-blue">${r.utm}</span></td>
      <td>${r.clicks.toLocaleString()}</td>
      <td>${r.signups.toLocaleString()}</td>
      <td>${r.conversions.toLocaleString()}</td>
      <td>$${r.revenue.toLocaleString()}</td>
      <td><strong>${rate}%</strong></td>
    </tr>`;
  }).join('');
}

function renderCustomerTable() {
  const tbody = document.getElementById('customerTableBody');
  if (!tbody || !PARTNER) return;

  let breakdown = PARTNER.CUSTOMER_BREAKDOWN;

  // For filtered daily data, show period totals
  if (hasDailyData() && currentTimeframe.range !== 'all') {
    const filtered = filterDailyData();
    const totals = computeFilteredTotals(filtered);
    breakdown = [
      { status: 'Period Payout', count: totals.conversions, mrr: Math.round(totals.payout), pct: ((totals.payout / (totals.revenue || 1)) * 100).toFixed(1) },
      { status: 'Period Revenue', count: totals.clicks, mrr: Math.round(totals.revenue), pct: 100 },
    ];
  }

  tbody.innerHTML = breakdown.map(r => {
    const badge = r.status.includes('Payout') || r.status === 'Recurring' || r.status === 'Partnerships Revenue' ? 'green'
      : r.status.includes('Revenue') || r.status === 'New' || r.status === 'Affiliate Revenue' ? 'blue' : 'red';
    return `<tr>
      <td><span class="badge badge-${badge}">${r.status}</span></td>
      <td>${r.count.toLocaleString()}</td>
      <td>${r.mrr < 0 ? '-' : ''}$${Math.abs(r.mrr).toLocaleString()}</td>
      <td>${r.pct}%</td>
    </tr>`;
  }).join('');
}

function renderFeed() {
  const el = document.getElementById('feedContainer');
  if (!el || !PARTNER) return;

  let conversions = PARTNER.RECENT_CONVERSIONS;

  // For filtered daily data, show most recent days as feed
  if (hasDailyData() && currentTimeframe.range !== 'all') {
    const filtered = filterDailyData();
    // Show last 10 days in the filtered range
    const recent = filtered.slice(-10).reverse();
    conversions = recent.map(d => {
      const dt = new Date(d.date + 'T00:00:00');
      const dateStr = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const badge = d.payout > 600 ? 'yellow' : d.payout > 400 ? 'green' : 'blue';
      return {
        time: dateStr,
        plan: '$' + d.payout.toFixed(2) + ' payout',
        source: d.conversions + ' conversions from ' + d.clicks + ' clicks',
        badge: badge,
      };
    });
  }

  el.innerHTML = conversions.map(r => `
    <div class="feed-item">
      <div class="feed-dot"></div>
      <div class="feed-info">
        <strong>New conversion</strong> — <span class="feed-plan"><span class="badge badge-${r.badge}">${r.plan}</span></span>
        <div style="font-size:12px;color:var(--text-muted);margin-top:2px">from "${r.source}"</div>
      </div>
      <span class="feed-time">${r.time}</span>
    </div>
  `).join('');
}

// ---------- Sort ----------
let currentSort = { key: 'conversions', dir: 'desc' };

function initSortHeaders() {
  document.querySelectorAll('[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const key = th.dataset.sort;
      if (currentSort.key === key) {
        currentSort.dir = currentSort.dir === 'desc' ? 'asc' : 'desc';
      } else {
        currentSort = { key, dir: 'desc' };
      }
      document.querySelectorAll('[data-sort]').forEach(h => {
        h.classList.remove('sorted');
        h.querySelector('.sort-icon').textContent = '↕';
      });
      th.classList.add('sorted');
      th.querySelector('.sort-icon').textContent = currentSort.dir === 'desc' ? '↓' : '↑';
      renderLinkTable(currentSort.key, currentSort.dir);
    });
  });
}

// ---------- CSV Export ----------
function exportCSV(tableId, filename) {
  const table = document.getElementById(tableId);
  if (!table) return;
  const rows = [];
  table.querySelectorAll('tr').forEach(tr => {
    const cells = [];
    tr.querySelectorAll('th, td').forEach(td => {
      let text = td.textContent.trim().replace(/"/g, '""');
      cells.push(`"${text}"`);
    });
    rows.push(cells.join(','));
  });
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  showToast('CSV exported successfully!');
}

// ============================================================
//  MASTER RENDER — called on timeframe change & theme toggle
// ============================================================

function renderAllDashboard() {
  renderKPIs();
  renderCharts();
  renderLinkTable(currentSort.key, currentSort.dir);
  renderCustomerTable();
  renderFeed();
}

// ============================================================
//  UTM GENERATOR (unchanged)
// ============================================================

function initGenerator() {
  const form = document.getElementById('utmForm');
  if (!form) return;

  const baseUrlInput = document.getElementById('baseUrl');
  if (baseUrlInput && PARTNER) {
    baseUrlInput.value = PARTNER.baseUrl;
    baseUrlInput.placeholder = PARTNER.baseUrl;
  }

  const fields = ['baseUrl', 'platform', 'campaign', 'content'];
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', generateLink);
    if (el) el.addEventListener('change', generateLink);
  });

  loadHistory();
  generateLink();
}

function generateLink() {
  const defaultBase = PARTNER ? PARTNER.baseUrl : 'https://vidiq.com/yourivanhofwegen';
  const base = document.getElementById('baseUrl')?.value?.trim() || defaultBase;
  const platform = document.getElementById('platform')?.value || 'youtube';
  const campaign = document.getElementById('campaign')?.value?.trim() || '';
  const content = document.getElementById('content')?.value?.trim() || '';

  const platformMedium = {
    youtube: 'video', tiktok: 'video', instagram: 'social',
    twitter: 'social', linkedin: 'social', website: 'referral', other: 'referral'
  };

  const params = new URLSearchParams();
  params.set('utm_source', platform);
  params.set('utm_medium', platformMedium[platform] || 'referral');
  if (campaign) params.set('utm_campaign', campaign.toLowerCase().replace(/\s+/g, '_'));
  if (content) params.set('utm_content', content.toLowerCase().replace(/\s+/g, '_'));

  const fullUrl = base + '?' + params.toString();

  const output = document.getElementById('generatedLink');
  if (output) output.querySelector('code').textContent = fullUrl;

  const short = document.getElementById('shortPreview');
  if (short) {
    const hash = btoa(fullUrl).slice(0, 6);
    short.textContent = `Short link: vdiq.co/${hash}`;
  }

  return fullUrl;
}

function copyLink() {
  const code = document.querySelector('#generatedLink code');
  if (!code) return;
  navigator.clipboard.writeText(code.textContent).then(() => {
    const btn = document.querySelector('#generatedLink .copy-btn');
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
  });
}

function saveLink() {
  const code = document.querySelector('#generatedLink code');
  if (!code) return;
  const link = code.textContent;
  const campaign = document.getElementById('campaign')?.value?.trim() || 'Untitled';
  const platform = document.getElementById('platform')?.value || 'youtube';
  const history = JSON.parse(localStorage.getItem('vidiq-link-history') || '[]');
  history.unshift({ url: link, campaign, platform, date: new Date().toISOString() });
  if (history.length > 50) history.pop();
  localStorage.setItem('vidiq-link-history', JSON.stringify(history));
  loadHistory();
  showToast('Link saved to history!');
}

function loadHistory() {
  const el = document.getElementById('historyContainer');
  if (!el) return;
  const history = JSON.parse(localStorage.getItem('vidiq-link-history') || '[]');
  if (history.length === 0) {
    el.innerHTML = '<p style="color:var(--text-muted);font-size:13px;padding:12px 0">No links generated yet.</p>';
    return;
  }
  el.innerHTML = history.slice(0, 20).map(h => {
    const d = new Date(h.date);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    return `
      <div class="link-history-item">
        <div>
          <div style="font-weight:600">${h.campaign}</div>
          <div class="link-meta">${h.platform} · ${dateStr}</div>
          <div style="font-size:11px;color:var(--green-dark);word-break:break-all;margin-top:2px">${h.url}</div>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="navigator.clipboard.writeText('${h.url.replace(/'/g, "\\'")}');showToast('Copied!')">Copy</button>
      </div>`;
  }).join('');
}

function clearHistory() {
  localStorage.removeItem('vidiq-link-history');
  loadHistory();
  showToast('History cleared');
}

function generateBulk() {
  const textarea = document.getElementById('bulkTitles');
  const output = document.getElementById('bulkOutput');
  if (!textarea || !output) return;

  const titles = textarea.value.split('\n').map(t => t.trim()).filter(Boolean);
  if (titles.length === 0) { output.innerHTML = '<p style="color:var(--text-muted);font-size:13px">Enter video titles above (one per line).</p>'; return; }

  const defaultBase = PARTNER ? PARTNER.baseUrl : 'https://vidiq.com/yourivanhofwegen';
  const base = document.getElementById('baseUrl')?.value?.trim() || defaultBase;
  const platform = document.getElementById('platform')?.value || 'youtube';
  const campaign = document.getElementById('campaign')?.value?.trim() || '';
  const platformMedium = { youtube: 'video', tiktok: 'video', instagram: 'social', twitter: 'social', linkedin: 'social', website: 'referral', other: 'referral' };

  output.innerHTML = titles.map(title => {
    const params = new URLSearchParams();
    params.set('utm_source', platform);
    params.set('utm_medium', platformMedium[platform] || 'referral');
    if (campaign) params.set('utm_campaign', campaign.toLowerCase().replace(/\s+/g, '_'));
    params.set('utm_content', title.toLowerCase().replace(/\s+/g, '_'));
    const url = base + '?' + params.toString();
    return `<div class="link-output"><code>${url}</code><button class="copy-btn" onclick="navigator.clipboard.writeText('${url.replace(/'/g, "\\'")}');this.textContent='Copied!';setTimeout(()=>this.textContent='Copy',1500)">Copy</button></div>`;
  }).join('');
}

function copyAllBulk() {
  const codes = document.querySelectorAll('#bulkOutput code');
  const all = Array.from(codes).map(c => c.textContent).join('\n');
  if (!all) return;
  navigator.clipboard.writeText(all).then(() => showToast('All links copied!'));
}

// ============================================================
//  INIT
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // Load partner config
  if (typeof getPartnerConfig === 'function') {
    PARTNER = getPartnerConfig();
    console.log('[vidIQ] Partner loaded:', PARTNER?.name, PARTNER?.slug);
  } else {
    console.warn('[vidIQ] partners-data.js not loaded, using fallback');
    PARTNER = buildDefaultPartner();
  }

  initTheme();
  populatePartnerUI();

  // Dashboard-specific
  if (document.getElementById('earningsChart')) {
    initTimeframeUI();
    renderCharts();
    renderLinkTable();
    renderCustomerTable();
    renderFeed();
    initSortHeaders();
  }

  // Generator-specific
  if (document.getElementById('utmForm')) {
    initGenerator();
  }

  document.querySelector('.sidebar-overlay')?.addEventListener('click', toggleSidebar);
});
