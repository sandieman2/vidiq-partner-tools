/* ============================================
   vidIQ Partner Dashboard — App Logic
   ============================================ */

// ---------- Active partner (set on DOMContentLoaded) ----------
let PARTNER = null;

// Fallback partner when partners-data.js hasn't loaded
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
    monthlyEarnings: [],
    newRevenue: [],
    recurringRevenue: [],
    funnel: { clicks: 0, signups: 0, trial: 0, paid: 0, retained: 0 },
    links: [],
    customers: { recurring: { count: 0, mrr: 0 }, new: { count: 0, mrr: 0 }, churned: { count: 0, mrr: 0 } },
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
  // Re-render charts with new theme colors
  if (typeof renderCharts === 'function') renderCharts();
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

// ---------- Populate Header & KPI from Partner Config ----------
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
    // Keep the SVG, replace just the text node
    const textNodes = Array.from(urlEl.childNodes).filter(n => n.nodeType === Node.TEXT_NODE);
    textNodes.forEach(n => n.remove());
    urlEl.appendChild(document.createTextNode('\n        ' + PARTNER.url + '\n      '));
  }

  // Page title
  document.title = PARTNER.name + ' — vidIQ Partner Dashboard';

  // KPI cards
  const kpiGrid = document.querySelector('.kpi-grid');
  if (kpiGrid && PARTNER.kpi) {
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

  // Sidebar nav: preserve partner param on links
  const slug = getPartnerSlug();
  document.querySelectorAll('.sidebar-nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && href !== '#' && !href.startsWith('http')) {
      const base = href.split('?')[0];
      a.setAttribute('href', base + '?partner=' + slug);
    }
  });
}

// ---------- Render Charts ----------
let chartInstances = {};

function renderCharts() {
  if (!PARTNER) return;

  // Destroy existing
  Object.values(chartInstances).forEach(c => c.destroy());
  chartInstances = {};

  const t = getThemeColors();

  // 1. Earnings Over Time
  const ctx1 = document.getElementById('earningsChart');
  if (ctx1) {
    const defs = chartDefaults();
    chartInstances.earnings = new Chart(ctx1.getContext('2d'), {
      type: 'line',
      data: {
        labels: PARTNER.MONTHS,
        datasets: [{
          label: 'Monthly Earnings ($)',
          data: PARTNER.EARNINGS_DATA,
          borderColor: '#00C853',
          backgroundColor: 'rgba(0,200,83,.08)',
          borderWidth: 2.5,
          fill: true,
          tension: .35,
          pointRadius: 4,
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
        },
        scales: {
          ...defs.scales,
          y: { ...defs.scales.y, ticks: { ...defs.scales.y.ticks, callback: v => '$' + v.toLocaleString() } }
        }
      }
    });
  }

  // 2. New vs Recurring Revenue
  const ctx2 = document.getElementById('revenueChart');
  if (ctx2) {
    const defs = chartDefaults();
    chartInstances.revenue = new Chart(ctx2.getContext('2d'), {
      type: 'bar',
      data: {
        labels: PARTNER.MONTHS,
        datasets: [
          { label: 'New Revenue', data: PARTNER.NEW_REV, backgroundColor: '#3B82F6', borderRadius: 4, barPercentage: .65 },
          { label: 'Recurring Revenue', data: PARTNER.RECURRING_REV, backgroundColor: '#00C853', borderRadius: 4, barPercentage: .65 },
        ]
      },
      options: {
        ...defs,
        plugins: { ...defs.plugins },
        scales: {
          ...defs.scales,
          x: { ...defs.scales.x, stacked: true },
          y: { ...defs.scales.y, stacked: true, ticks: { ...defs.scales.y.ticks, callback: v => '$' + v.toLocaleString() } }
        }
      }
    });
  }

  // 3. Funnel (DOM-based, not Chart.js)
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
          x: { ...defs.scales.x, ticks: { ...defs.scales.x.ticks } },
          y: { ...defs.scales.y, ticks: { ...defs.scales.y.ticks, font: { size: 11 } }, grid: { display: false } },
        }
      }
    });
  }
}

function renderFunnel() {
  const el = document.getElementById('funnelContainer');
  if (!el || !PARTNER) return;
  const max = PARTNER.FUNNEL_DATA[0].value;
  el.innerHTML = PARTNER.FUNNEL_DATA.map((d, i) => {
    const pct = (d.value / max * 100).toFixed(1);
    const convRate = i === 0 ? '100%' : (d.value / PARTNER.FUNNEL_DATA[i - 1].value * 100).toFixed(1) + '%';
    return `
      <div class="funnel-step animate-in" style="animation-delay:${i * .1}s">
        <span class="funnel-label">${d.label}</span>
        <div class="funnel-bar-wrap">
          <div class="funnel-bar" style="width:${pct}%;background:${d.color}">${d.value.toLocaleString()}</div>
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
  tbody.innerHTML = PARTNER.CUSTOMER_BREAKDOWN.map(r => {
    const badge = r.status === 'Recurring' ? 'green' : r.status === 'New' ? 'blue' : 'red';
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
  el.innerHTML = PARTNER.RECENT_CONVERSIONS.map(r => `
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
      // Update sort icons
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

// ---------- UTM Generator ----------
function initGenerator() {
  const form = document.getElementById('utmForm');
  if (!form) return;

  // Set the base URL from partner config
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

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', () => {
  // Load partner config (with fallback if partners-data.js hasn't loaded yet)
  if (typeof getPartnerConfig === 'function') {
    PARTNER = getPartnerConfig();
    console.log('[vidIQ] Partner loaded:', PARTNER?.name, PARTNER?.slug);
  } else {
    console.warn('[vidIQ] partners-data.js not loaded, using fallback');
    PARTNER = buildDefaultPartner();
  }

  initTheme();

  // Populate header, KPI, and partner-specific UI
  console.log('[vidIQ] Populating UI, PARTNER:', !!PARTNER, 'KPI:', !!PARTNER?.kpi);
  populatePartnerUI();

  // Dashboard-specific
  if (document.getElementById('earningsChart')) {
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

  // Close sidebar on overlay click
  document.querySelector('.sidebar-overlay')?.addEventListener('click', toggleSidebar);
});
