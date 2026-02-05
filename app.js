/* ============================================
   vidIQ Partner Dashboard — App Logic
   ============================================ */

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

// ---------- Mock Data ----------
const MONTHS = ['Jul \'24','Aug','Sep','Oct','Nov','Dec','Jan \'25','Feb','Mar','Apr','May','Jun'];
const EARNINGS_DATA = [5200, 5650, 6100, 6400, 6900, 7200, 7500, 7850, 8100, 8350, 8200, 8450];
const NEW_REV = [1800, 1950, 2100, 2000, 2350, 2400, 2550, 2700, 2800, 2900, 2600, 2750];
const RECURRING_REV = [3400, 3700, 4000, 4400, 4550, 4800, 4950, 5150, 5300, 5450, 5600, 5700];

const FUNNEL_DATA = [
  { label: 'Clicks', value: 135420, color: '#3B82F6' },
  { label: 'Signups', value: 10320, color: '#8B5CF6' },
  { label: 'Trial', value: 7850, color: '#F59E0B' },
  { label: 'Paid', value: 3920, color: '#00C853' },
  { label: 'Retained', value: 2847, color: '#059669' },
];

const TOP_CONTENT = [
  { name: 'How to Get More Views on YouTube 2025', conversions: 842 },
  { name: 'YouTube SEO Tutorial — Complete Guide', conversions: 623 },
  { name: 'vidIQ Review — Is It Worth It?', conversions: 571 },
  { name: '10 YouTube Tips for Small Channels', conversions: 498 },
  { name: 'How I Grew to 100K Subscribers', conversions: 387 },
  { name: 'Best YouTube Tools for Creators', conversions: 345 },
  { name: 'YouTube Algorithm Explained 2025', conversions: 312 },
  { name: 'Keyword Research for YouTube', conversions: 289 },
];

const LINK_TABLE = [
  { name: 'How to Get More Views on YouTube 2025', utm: 'youtube', clicks: 28450, signups: 2150, conversions: 842, revenue: 25260 },
  { name: 'YouTube SEO Tutorial — Complete Guide', utm: 'youtube', clicks: 19200, signups: 1480, conversions: 623, revenue: 18690 },
  { name: 'vidIQ Review — Is It Worth It?', utm: 'youtube', clicks: 15800, signups: 1320, conversions: 571, revenue: 17130 },
  { name: '10 YouTube Tips for Small Channels', utm: 'youtube', clicks: 14600, signups: 1100, conversions: 498, revenue: 14940 },
  { name: 'How I Grew to 100K Subscribers', utm: 'youtube', clicks: 12300, signups: 950, conversions: 387, revenue: 11610 },
  { name: 'Best YouTube Tools for Creators', utm: 'website', clicks: 10200, signups: 780, conversions: 345, revenue: 10350 },
  { name: 'YouTube Algorithm Explained 2025', utm: 'tiktok', clicks: 9800, signups: 710, conversions: 312, revenue: 9360 },
  { name: 'Keyword Research for YouTube', utm: 'instagram', clicks: 8400, signups: 620, conversions: 289, revenue: 8670 },
  { name: 'Channel Audit Live Stream', utm: 'youtube', clicks: 6200, signups: 480, conversions: 198, revenue: 5940 },
  { name: 'Shorts vs Long-form — What Works?', utm: 'youtube', clicks: 5800, signups: 410, conversions: 175, revenue: 5250 },
  { name: 'Instagram → YouTube Funnel Guide', utm: 'instagram', clicks: 4620, signups: 320, conversions: 80, revenue: 2433 },
];

const CUSTOMER_BREAKDOWN = [
  { status: 'Recurring', count: 2274, mrr: 68220, pct: 79.9 },
  { status: 'New', count: 573, mrr: 17190, pct: 20.1 },
  { status: 'Churned', count: 91, mrr: -2730, pct: 3.2 },
];

const RECENT_CONVERSIONS = [
  { time: '2 min ago', plan: 'Pro Monthly', source: 'YouTube SEO Tutorial', badge: 'green' },
  { time: '8 min ago', plan: 'Boost Annual', source: 'How to Get More Views 2025', badge: 'blue' },
  { time: '14 min ago', plan: 'Pro Monthly', source: 'vidIQ Review — Is It Worth It?', badge: 'green' },
  { time: '23 min ago', plan: 'Max Annual', source: '10 YouTube Tips for Small Channels', badge: 'yellow' },
  { time: '31 min ago', plan: 'Pro Monthly', source: 'Best YouTube Tools for Creators', badge: 'green' },
  { time: '45 min ago', plan: 'Boost Monthly', source: 'YouTube Algorithm Explained 2025', badge: 'blue' },
  { time: '1 hr ago', plan: 'Pro Annual', source: 'How I Grew to 100K Subscribers', badge: 'green' },
  { time: '1 hr ago', plan: 'Pro Monthly', source: 'Keyword Research for YouTube', badge: 'green' },
  { time: '2 hr ago', plan: 'Max Monthly', source: 'Channel Audit Live Stream', badge: 'yellow' },
  { time: '2 hr ago', plan: 'Boost Annual', source: 'Shorts vs Long-form — What Works?', badge: 'blue' },
];

// ---------- Render Charts ----------
let chartInstances = {};

function renderCharts() {
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
        labels: MONTHS,
        datasets: [{
          label: 'Monthly Earnings ($)',
          data: EARNINGS_DATA,
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
        labels: MONTHS,
        datasets: [
          { label: 'New Revenue', data: NEW_REV, backgroundColor: '#3B82F6', borderRadius: 4, barPercentage: .65 },
          { label: 'Recurring Revenue', data: RECURRING_REV, backgroundColor: '#00C853', borderRadius: 4, barPercentage: .65 },
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
    const labels = TOP_CONTENT.map(d => d.name.length > 30 ? d.name.slice(0, 30) + '…' : d.name);
    chartInstances.content = new Chart(ctx4.getContext('2d'), {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Conversions',
          data: TOP_CONTENT.map(d => d.conversions),
          backgroundColor: TOP_CONTENT.map((_, i) => {
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
  if (!el) return;
  const max = FUNNEL_DATA[0].value;
  el.innerHTML = FUNNEL_DATA.map((d, i) => {
    const pct = (d.value / max * 100).toFixed(1);
    const convRate = i === 0 ? '100%' : (d.value / FUNNEL_DATA[i - 1].value * 100).toFixed(1) + '%';
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
  if (!tbody) return;

  const sorted = [...LINK_TABLE].sort((a, b) => {
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
  if (!tbody) return;
  tbody.innerHTML = CUSTOMER_BREAKDOWN.map(r => {
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
  if (!el) return;
  el.innerHTML = RECENT_CONVERSIONS.map(r => `
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
  const base = document.getElementById('baseUrl')?.value?.trim() || 'https://vidiq.com/yourivanhofwegen';
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

  const base = document.getElementById('baseUrl')?.value?.trim() || 'https://vidiq.com/yourivanhofwegen';
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
  initTheme();

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
