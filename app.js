/* ============================================
   vidIQ Partner Dashboard — App Logic (v5)
   Polished: removed funnel/customer breakdown,
   fixed recent conversions, partial month handling
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
    TOP_CONTENT: [], LINK_TABLE: [],
    RECENT_CONVERSIONS: [],
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
      return null;
  }
  return { from, to };
}

function filterDailyData() {
  if (!hasDailyData()) return null;
  const range = getDateRange();
  if (!range) return PARTNER.DAILY_DATA;
  return PARTNER.DAILY_DATA.filter(d => {
    const dt = new Date(d.date + 'T00:00:00');
    return dt >= range.from && dt <= range.to;
  });
}

function aggregateForChart(dailyData) {
  if (!dailyData || dailyData.length === 0) return { labels: [], payouts: [], revenues: [], isPartial: [] };

  const days = dailyData.length;
  let mode = 'day';
  if (days > 90) mode = 'month';
  else if (days > 31) mode = 'week';

  const buckets = {};
  const bucketOrder = [];

  dailyData.forEach(d => {
    let key;
    if (mode === 'day') {
      key = d.date;
    } else if (mode === 'week') {
      const dt = new Date(d.date + 'T00:00:00');
      const day = dt.getDay();
      const diff = dt.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(dt);
      monday.setDate(diff);
      key = 'W ' + monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      key = d.date.substring(0, 7);
    }

    if (!buckets[key]) {
      buckets[key] = { payout: 0, revenue: 0, clicks: 0, conversions: 0, days: 0 };
      bucketOrder.push(key);
    }
    buckets[key].payout += d.payout;
    buckets[key].revenue += d.revenue;
    buckets[key].clicks += d.clicks;
    buckets[key].conversions += d.conversions;
    buckets[key].days += 1;
  });

  const sortedKeys = bucketOrder;
  if (mode === 'day' || mode === 'month') {
    sortedKeys.sort();
  }

  // Detect partial current month
  const now = new Date();
  const currentMonthKey = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
  const daysInCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  const isPartial = sortedKeys.map(k => {
    if (mode === 'month' && k === currentMonthKey) {
      return buckets[k].days < daysInCurrentMonth;
    }
    return false;
  });

  const labels = sortedKeys.map((k, i) => {
    if (mode === 'day') {
      const dt = new Date(k + 'T00:00:00');
      return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (mode === 'month') {
      const parts = k.split('-');
      const dt = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
      let label = dt.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      if (isPartial[i]) {
        label += ' (MTD)';
      }
      return label;
    }
    return k;
  });

  return {
    labels,
    payouts: sortedKeys.map(k => Math.round(buckets[k].payout * 100) / 100),
    revenues: sortedKeys.map(k => Math.round(buckets[k].revenue * 100) / 100),
    clicks: sortedKeys.map(k => buckets[k].clicks),
    conversions: sortedKeys.map(k => buckets[k].conversions),
    isPartial,
    bucketDays: sortedKeys.map(k => buckets[k].days),
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
//  PARTIAL MONTH HELPERS
// ============================================================

function getCurrentMonthInfo() {
  if (!hasDailyData()) return null;
  const now = new Date();
  const yearMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
  const monthName = now.toLocaleDateString('en-US', { month: 'short' });
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  // Count how many days of data we have for the current month
  const currentMonthData = PARTNER.DAILY_DATA.filter(d => d.date.startsWith(yearMonth));
  const daysWithData = currentMonthData.length;

  return {
    yearMonth,
    monthName,
    daysInMonth,
    daysWithData,
    isPartial: daysWithData < daysInMonth,
    data: currentMonthData,
  };
}

function getLastMonthInfo() {
  if (!hasDailyData()) return null;
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const yearMonth = lastMonth.getFullYear() + '-' + String(lastMonth.getMonth() + 1).padStart(2, '0');
  const monthName = lastMonth.toLocaleDateString('en-US', { month: 'short' });

  const lastMonthData = PARTNER.DAILY_DATA.filter(d => d.date.startsWith(yearMonth));

  return {
    yearMonth,
    monthName,
    data: lastMonthData,
  };
}

// ============================================================
//  TIMEFRAME UI
// ============================================================

function initTimeframeUI() {
  const bar = document.getElementById('timeframeBar');
  if (!bar) return;

  if (!document.getElementById('earningsChart')) {
    bar.style.display = 'none';
    return;
  }

  const pills = document.querySelectorAll('.tf-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      const range = pill.dataset.range;
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const customEl = document.getElementById('tfCustomRange');

      if (range === 'custom') {
        customEl.style.display = 'flex';
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

  if (hasDailyData()) {
    const data = PARTNER.DAILY_DATA;
    const minDate = data[0].date;
    const maxDate = data[data.length - 1].date;
    const fromInput = document.getElementById('tfDateFrom');
    const toInput = document.getElementById('tfDateTo');
    if (fromInput) { fromInput.min = minDate; fromInput.max = maxDate; }
    if (toInput) { toInput.min = minDate; toInput.max = maxDate; }
  }

  const notice = document.getElementById('tfNotice');
  if (notice) {
    notice.style.display = hasDailyData() ? 'none' : 'flex';
  }

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
    el.textContent = filtered.length + ' days · All data';
  } else {
    const fromStr = range.from.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const toStr = range.to.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    el.textContent = filtered.length + ' days · ' + fromStr + ' — ' + toStr;
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

  const avatar = document.querySelector('.header-right .avatar');
  if (avatar) avatar.textContent = PARTNER.initials;

  const nameEl = document.querySelector('.header-right > span');
  if (nameEl) nameEl.textContent = PARTNER.name;

  const urlEl = document.querySelector('.partner-url');
  if (urlEl) {
    const textNodes = Array.from(urlEl.childNodes).filter(n => n.nodeType === Node.TEXT_NODE);
    textNodes.forEach(n => n.remove());
    urlEl.appendChild(document.createTextNode('\n        ' + PARTNER.url + '\n      '));
  }

  document.title = PARTNER.name + ' — vidIQ Partner Dashboard';

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

  if (hasDailyData()) {
    const filtered = filterDailyData();
    const totals = computeFilteredTotals(filtered);
    const isAll = currentTimeframe.range === 'all';

    if (isAll) {
      renderSmartKPIs(kpiGrid);
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
        const colorStyle = k.color ? ' style="color:' + k.color + '"' : '';
        return '<div class="kpi-card animate-in">' +
          '<div class="kpi-label">' + k.label + '</div>' +
          '<div class="kpi-value"' + colorStyle + '>' + k.value + '</div>' +
          '<div class="kpi-change ' + k.direction + '">' + k.change + '</div>' +
        '</div>';
      }).join('');
    }
  } else {
    renderStaticKPIs(kpiGrid);
  }
}

/**
 * Smart KPIs: for "all time" view with daily data, fix misleading partial-month comparisons
 */
function renderSmartKPIs(kpiGrid) {
  if (!PARTNER.kpi) return;

  const cmInfo = getCurrentMonthInfo();
  const lmInfo = getLastMonthInfo();

  // Build smart KPI overrides
  const kpiOrder = ['totalEarnings', 'thisMonth', 'activeSubs', 'newSignups', 'conversionRate', 'churnRate'];
  const kpiLabels = {
    totalEarnings: 'Total Earnings',
    thisMonth: 'This Month',
    activeSubs: 'Total Conversions',
    newSignups: 'Conversions This Month',
    conversionRate: 'Conversion Rate',
    churnRate: 'Overall Conv. Rate',
  };

  kpiGrid.innerHTML = kpiOrder.map(key => {
    const k = PARTNER.kpi[key];
    if (!k) return '';

    let label = k.label || kpiLabels[key];
    let value = k.value;
    let change = k.change;
    let direction = k.direction;

    // Fix "This Month" KPI — show MTD context
    if (key === 'thisMonth' && cmInfo && cmInfo.isPartial) {
      const cmTotals = computeFilteredTotals(cmInfo.data);
      label = cmInfo.monthName + ' MTD (' + cmInfo.daysWithData + ' days)';
      value = '$' + formatMoney(cmTotals.payout);
      // Calculate daily run rate and project
      const dailyRate = cmTotals.payout / cmInfo.daysWithData;
      const projected = dailyRate * cmInfo.daysInMonth;
      change = 'Projected: ~$' + Math.round(projected).toLocaleString() + '/mo';
      direction = 'up';
    }

    // Fix "Conversions This Month" — show MTD context
    if (key === 'newSignups' && cmInfo && cmInfo.isPartial) {
      const cmTotals = computeFilteredTotals(cmInfo.data);
      label = 'Conversions · ' + cmInfo.monthName + ' MTD';
      value = cmTotals.conversions.toLocaleString();
      const dailyRate = cmTotals.conversions / cmInfo.daysWithData;
      const projected = Math.round(dailyRate * cmInfo.daysInMonth);
      change = 'Projected: ~' + projected.toLocaleString() + '/mo';
      direction = 'up';
    }

    const colorStyle = k.color ? ' style="color:' + k.color + '"' : '';
    return '<div class="kpi-card animate-in">' +
      '<div class="kpi-label">' + label + '</div>' +
      '<div class="kpi-value"' + colorStyle + '>' + value + '</div>' +
      '<div class="kpi-change ' + direction + '">' + change + '</div>' +
    '</div>';
  }).join('');
}

function renderStaticKPIs(kpiGrid) {
  if (!PARTNER.kpi) return;
  const kpiOrder = ['totalEarnings', 'thisMonth', 'activeSubs', 'newSignups', 'conversionRate', 'churnRate'];
  const kpiLabels = {
    totalEarnings: 'Total Earnings',
    thisMonth: 'This Month',
    activeSubs: 'Total Conversions',
    newSignups: 'Conversions This Month',
    conversionRate: 'Conversion Rate',
    churnRate: 'Overall Conv. Rate',
  };
  kpiGrid.innerHTML = kpiOrder.map(key => {
    const k = PARTNER.kpi[key];
    if (!k) return '';
    const colorStyle = k.color ? ' style="color:' + k.color + '"' : '';
    const label = k.label || kpiLabels[key];
    return '<div class="kpi-card animate-in">' +
      '<div class="kpi-label">' + label + '</div>' +
      '<div class="kpi-value"' + colorStyle + '>' + k.value + '</div>' +
      '<div class="kpi-change ' + k.direction + '">' + k.change + '</div>' +
    '</div>';
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

  Object.values(chartInstances).forEach(c => c.destroy());
  chartInstances = {};

  const t = getThemeColors();

  let chartData;
  let useFiltered = hasDailyData() && currentTimeframe.range !== 'all';

  if (hasDailyData()) {
    const filtered = filterDailyData();
    chartData = aggregateForChart(filtered);
  }

  // 1. Earnings Over Time — with partial month dashed line
  const ctx1 = document.getElementById('earningsChart');
  if (ctx1) {
    const defs = chartDefaults();
    const labels = useFiltered || hasDailyData() ? chartData.labels : PARTNER.MONTHS;
    const data = useFiltered || hasDailyData() ? chartData.payouts : PARTNER.EARNINGS_DATA;
    const isPartial = chartData ? chartData.isPartial : [];

    const chartCard = ctx1.closest('.chart-card');
    if (chartCard) {
      const subtitle = chartCard.querySelector('h3 span');
      if (subtitle) {
        subtitle.textContent = hasDailyData() ? getTimeframeLabel() : 'Last 12 months';
      }
    }

    // Split data into complete and partial segments for dashed line effect
    const hasPartial = isPartial.length > 0 && isPartial[isPartial.length - 1];
    let completeData = data;
    let partialData = new Array(data.length).fill(null);

    if (hasPartial) {
      completeData = data.map((v, i) => isPartial[i] ? null : v);
      // Connect the last complete point to the partial point
      const lastCompleteIdx = completeData.length - 2;
      partialData = data.map((v, i) => {
        if (i === lastCompleteIdx) return v; // bridge point
        if (isPartial[i]) return v;
        return null;
      });
    }

    const datasets = [{
      label: hasDailyData() ? 'Payout ($)' : 'Monthly Earnings ($)',
      data: completeData,
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
      spanGaps: false,
    }];

    if (hasPartial) {
      datasets.push({
        label: 'Current Month (MTD)',
        data: partialData,
        borderColor: '#00C853',
        backgroundColor: 'rgba(0,200,83,.04)',
        borderWidth: 2.5,
        borderDash: [6, 4],
        fill: true,
        tension: .35,
        pointRadius: 5,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#00C853',
        pointBorderWidth: 2.5,
        pointHoverRadius: 7,
        spanGaps: true,
      });
    }

    chartInstances.earnings = new Chart(ctx1.getContext('2d'), {
      type: 'line',
      data: { labels: labels, datasets: datasets },
      options: {
        ...defs,
        plugins: {
          ...defs.plugins,
          legend: { display: hasPartial, labels: { ...defs.plugins.legend.labels, filter: function(item) { return true; } } },
          tooltip: {
            ...defs.plugins.tooltip,
            callbacks: {
              label: function(ctx) {
                if (ctx.parsed.y === null) return null;
                return ctx.dataset.label + ': $' + ctx.parsed.y.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
              },
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
    const isPartial = chartData ? chartData.isPartial : [];

    if (hasDailyData()) {
      labels = chartData.labels;
      const chartCard = ctx2.closest('.chart-card');
      if (chartCard) {
        const h3 = chartCard.querySelector('h3');
        const subtitle = h3.querySelector('span');
        const titleText = h3.childNodes[0];
        if (titleText && titleText.nodeType === Node.TEXT_NODE) {
          titleText.textContent = 'Payout vs Revenue\n          ';
        }
        if (subtitle) subtitle.textContent = getTimeframeLabel();
      }

      // Add subtle pattern for partial months
      const payoutBg = chartData.payouts.map((v, i) => isPartial[i] ? 'rgba(59, 130, 246, 0.5)' : '#3B82F6');
      const revenueBg = chartData.revenues.map((v, i) => isPartial[i] ? 'rgba(0, 200, 83, 0.5)' : '#00C853');
      const payoutBorder = chartData.payouts.map((v, i) => isPartial[i] ? '#3B82F6' : 'transparent');
      const revenueBorder = chartData.revenues.map((v, i) => isPartial[i] ? '#00C853' : 'transparent');

      datasets = [
        {
          label: 'Payout (Your Earnings)',
          data: chartData.payouts,
          backgroundColor: payoutBg,
          borderColor: payoutBorder,
          borderWidth: isPartial.some(Boolean) ? 2 : 0,
          borderDash: [4, 3],
          borderRadius: 4,
          barPercentage: .65,
        },
        {
          label: 'Revenue (vidIQ Total)',
          data: chartData.revenues,
          backgroundColor: revenueBg,
          borderColor: revenueBorder,
          borderWidth: isPartial.some(Boolean) ? 2 : 0,
          borderDash: [4, 3],
          borderRadius: 4,
          barPercentage: .65,
        },
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
              afterBody: function(tooltipItems) {
                if (!isPartial.length) return '';
                const idx = tooltipItems[0].dataIndex;
                if (isPartial[idx] && chartData) {
                  return '⚠ Partial month (' + chartData.bucketDays[idx] + ' days)';
                }
                return '';
              }
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

  // 3. Top Converting Content
  const ctx4 = document.getElementById('contentChart');
  if (ctx4) {
    const defs = chartDefaults();
    const labels = PARTNER.TOP_CONTENT.map(d => d.name.length > 40 ? d.name.slice(0, 40) + '…' : d.name);
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
          borderRadius: 6,
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
    const rate = r.clicks > 0 ? ((r.conversions / r.clicks) * 100).toFixed(1) : '0.0';
    return '<tr>' +
      '<td><strong>' + r.name + '</strong></td>' +
      '<td><span class="badge badge-blue">' + r.utm + '</span></td>' +
      '<td>' + r.clicks.toLocaleString() + '</td>' +
      '<td>' + r.signups.toLocaleString() + '</td>' +
      '<td>' + r.conversions.toLocaleString() + '</td>' +
      '<td>$' + r.revenue.toLocaleString() + '</td>' +
      '<td><strong>' + rate + '%</strong></td>' +
    '</tr>';
  }).join('');
}

// ---------- Recent Conversions (from DAILY_DATA) ----------
function renderRecentConversions() {
  const tbody = document.getElementById('recentConversionsBody');
  if (!tbody || !PARTNER) return;

  if (hasDailyData()) {
    // Get last 14 days of data
    const recentDays = PARTNER.DAILY_DATA.slice(-14).reverse();

    tbody.innerHTML = recentDays.map((d, i) => {
      const dt = new Date(d.date + 'T00:00:00');
      const dateStr = dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const convRate = d.clicks > 0 ? ((d.conversions / d.clicks) * 100).toFixed(1) : '0.0';
      const payoutFormatted = d.payout.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});

      // Color-code payout
      let badgeClass = 'badge-blue';
      if (d.payout >= 700) badgeClass = 'badge-green';
      else if (d.payout >= 500) badgeClass = 'badge-blue';
      else badgeClass = 'badge-yellow';

      // Highlight today's row
      const isToday = i === 0;
      const rowClass = isToday ? ' class="row-today"' : '';

      return '<tr' + rowClass + '>' +
        '<td><strong>' + dateStr + '</strong>' + (isToday ? ' <span class="badge badge-green" style="margin-left:6px;font-size:10px">Today</span>' : '') + '</td>' +
        '<td>' + d.clicks.toLocaleString() + '</td>' +
        '<td><strong>' + d.conversions.toLocaleString() + '</strong></td>' +
        '<td>' + convRate + '%</td>' +
        '<td><span class="badge ' + badgeClass + '">$' + payoutFormatted + '</span></td>' +
      '</tr>';
    }).join('');
  } else {
    // Fallback to static RECENT_CONVERSIONS
    const conversions = PARTNER.RECENT_CONVERSIONS || [];
    tbody.innerHTML = conversions.map(r => {
      return '<tr>' +
        '<td><strong>' + r.time + '</strong></td>' +
        '<td>—</td>' +
        '<td>' + r.plan + '</td>' +
        '<td>—</td>' +
        '<td><span class="badge badge-' + r.badge + '">' + r.source + '</span></td>' +
      '</tr>';
    }).join('');
  }
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
      cells.push('"' + text + '"');
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
//  MASTER RENDER
// ============================================================

function renderAllDashboard() {
  renderKPIs();
  renderCharts();
  renderLinkTable(currentSort.key, currentSort.dir);
  renderRecentConversions();
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
    short.textContent = 'Short link: vdiq.co/' + hash;
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
    return '<div class="link-history-item">' +
      '<div>' +
        '<div style="font-weight:600">' + h.campaign + '</div>' +
        '<div class="link-meta">' + h.platform + ' · ' + dateStr + '</div>' +
        '<div style="font-size:11px;color:var(--green-dark);word-break:break-all;margin-top:2px">' + h.url + '</div>' +
      '</div>' +
      '<button class="btn btn-ghost btn-sm" onclick="navigator.clipboard.writeText(\'' + h.url.replace(/'/g, "\\'") + '\');showToast(\'Copied!\')">Copy</button>' +
    '</div>';
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
    return '<div class="link-output"><code>' + url + '</code><button class="copy-btn" onclick="navigator.clipboard.writeText(\'' + url.replace(/'/g, "\\'") + '\');this.textContent=\'Copied!\';setTimeout(()=>this.textContent=\'Copy\',1500)">Copy</button></div>';
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
    renderRecentConversions();
    initSortHeaders();
  }

  // Generator-specific
  if (document.getElementById('utmForm')) {
    initGenerator();
  }

  document.querySelector('.sidebar-overlay')?.addEventListener('click', toggleSidebar);
});
