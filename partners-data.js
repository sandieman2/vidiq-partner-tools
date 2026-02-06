/* ============================================
   vidIQ Partner Dashboard — Partner Data
   ============================================
   Data sourced from Tune/HasOffers API
   Last updated: 2026-02-05
   ============================================ */

const PARTNERS = {

  // ─── Youri Van Hof Wegen ────────────────────────────
  yourivanhofwegen: {
    name: 'Youri Van Hof Wegen',
    initials: 'YV',
    slug: 'yourivanhofwegen',
    url: 'vidiq.com/yourivanhofwegen',
    baseUrl: 'https://vidiq.com/yourivanhofwegen',

    kpi: {
      totalEarnings: { value: '$100,632<span style="font-size:16px">.85</span>', change: '↑ 18.2% all time', direction: 'up', color: 'var(--green)' },
      thisMonth:     { value: '$8,450<span style="font-size:16px">.00</span>', change: '↑ 3.0% vs last month', direction: 'up' },
      activeSubs:    { value: '2,847', change: '↑ 124 this month', direction: 'up' },
      newSignups:    { value: '573', change: '↑ 8.5% vs last month', direction: 'up' },
      conversionRate:{ value: '7.6%', change: '↑ 0.3pp vs last month', direction: 'up' },
      churnRate:     { value: '3.2%', change: '↑ 0.1pp vs last month', direction: 'down', color: 'var(--danger)' },
    },

    MONTHS: ['Jul \'24','Aug','Sep','Oct','Nov','Dec','Jan \'25','Feb','Mar','Apr','May','Jun'],
    EARNINGS_DATA: [5200, 5650, 6100, 6400, 6900, 7200, 7500, 7850, 8100, 8350, 8200, 8450],
    NEW_REV: [1800, 1950, 2100, 2000, 2350, 2400, 2550, 2700, 2800, 2900, 2600, 2750],
    RECURRING_REV: [3400, 3700, 4000, 4400, 4550, 4800, 4950, 5150, 5300, 5450, 5600, 5700],

    FUNNEL_DATA: [
      { label: 'Clicks', value: 135420, color: '#3B82F6' },
      { label: 'Signups', value: 10320, color: '#8B5CF6' },
      { label: 'Trial', value: 7850, color: '#F59E0B' },
      { label: 'Paid', value: 3920, color: '#00C853' },
      { label: 'Retained', value: 2847, color: '#059669' },
    ],

    TOP_CONTENT: [
      { name: 'How to Get More Views on YouTube 2025', conversions: 842 },
      { name: 'YouTube SEO Tutorial — Complete Guide', conversions: 623 },
      { name: 'vidIQ Review — Is It Worth It?', conversions: 571 },
      { name: '10 YouTube Tips for Small Channels', conversions: 498 },
      { name: 'How I Grew to 100K Subscribers', conversions: 387 },
      { name: 'Best YouTube Tools for Creators', conversions: 345 },
      { name: 'YouTube Algorithm Explained 2025', conversions: 312 },
      { name: 'Keyword Research for YouTube', conversions: 289 },
    ],

    LINK_TABLE: [
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
    ],

    CUSTOMER_BREAKDOWN: [
      { status: 'Recurring', count: 2274, mrr: 68220, pct: 79.9 },
      { status: 'New', count: 573, mrr: 17190, pct: 20.1 },
      { status: 'Churned', count: 91, mrr: -2730, pct: 3.2 },
    ],

    RECENT_CONVERSIONS: [
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
    ],
  },

  // ─── Robert Benjamin ────────────────────────────────
  // Data from Tune/HasOffers API — Affiliate ID: 24555
  // Partner since: 2022-08-29 | Payout Tier: Partner - 60
  // All-time (2022-2026): 141,812 clicks, 72,952 conversions
  // Total Payout: $566,680.51 | Total Revenue: $954,067.06
  robertbenjamin: {
    name: 'Robert Benjamin',
    initials: 'RB',
    slug: 'robertbenjamin',
    url: 'vidiq.com/robertbenjamin',
    baseUrl: 'https://vidiq.com/robertbenjamin',

    kpi: {
      totalEarnings: { value: '$566,680<span style="font-size:16px">.51</span>', change: 'Since Aug 2022', direction: 'up', color: 'var(--green)' },
      thisMonth:     { value: '$2,505<span style="font-size:16px">.96</span>', change: 'Feb 2026 MTD (5 days)', direction: 'up' },
      activeSubs:    { value: '72,952', change: 'All-time conversions', direction: 'up' },
      newSignups:    { value: '425', change: 'Feb 2026 MTD', direction: 'up' },
      conversionRate:{ value: '51.4%', change: 'Click → Conversion', direction: 'up' },
      churnRate:     { value: '141,812', change: 'All-time clicks', direction: 'up', color: 'var(--primary)' },
    },

    // Last 12 full months + current partial (Feb 2025 - Feb 2026)
    MONTHS: ['Feb \'25','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan \'26'],
    EARNINGS_DATA: [19174, 18678, 18079, 17916, 16069, 14967, 14910, 14960, 14823, 15391, 15053, 16235],
    NEW_REV: [9587, 9339, 9040, 8958, 8035, 7484, 7455, 7480, 7412, 7696, 7527, 8117],
    RECURRING_REV: [9587, 9339, 9039, 8958, 8034, 7483, 7455, 7480, 7411, 7695, 7526, 8118],

    FUNNEL_DATA: [
      { label: 'Clicks', value: 141812, color: '#3B82F6' },
      { label: 'Conversions', value: 72952, color: '#8B5CF6' },
      { label: 'Partnerships', value: 72712, color: '#F59E0B' },
      { label: 'Affiliate', value: 240, color: '#00C853' },
    ],

    TOP_CONTENT: [
      { name: 'vidIQ Partnerships program', conversions: 72712 },
      { name: 'vidIQ Affiliate Program', conversions: 240 },
    ],

    LINK_TABLE: [
      { name: 'vidIQ Partnerships', utm: 'partner', clicks: 140998, signups: 72712, conversions: 72712, revenue: 952301 },
      { name: 'vidIQ Affiliate Program', utm: 'affiliate', clicks: 814, signups: 240, conversions: 240, revenue: 1766 },
    ],

    CUSTOMER_BREAKDOWN: [
      { status: 'Partnerships Revenue', count: 72712, mrr: 952301, pct: 99.8 },
      { status: 'Affiliate Revenue', count: 240, mrr: 1766, pct: 0.2 },
    ],

    RECENT_CONVERSIONS: [
      { time: 'Feb 5', plan: '$549.85 payout', source: '68 conversions from 143 clicks', badge: 'green' },
      { time: 'Feb 4', plan: '$364.68 payout', source: '70 conversions from 96 clicks', badge: 'green' },
      { time: 'Feb 3', plan: '$469.66 payout', source: '70 conversions from 126 clicks', badge: 'blue' },
      { time: 'Feb 2', plan: '$480.88 payout', source: '81 conversions from 138 clicks', badge: 'green' },
      { time: 'Feb 1', plan: '$640.89 payout', source: '136 conversions from 205 clicks', badge: 'yellow' },
      { time: 'Jan 31', plan: '$523.34 payout', source: '80 conversions from 148 clicks', badge: 'green' },
      { time: 'Jan 30', plan: '$389.48 payout', source: '60 conversions from 93 clicks', badge: 'blue' },
      { time: 'Jan 29', plan: '$495.04 payout', source: '55 conversions from 50 clicks', badge: 'green' },
      { time: 'Jan 28', plan: '$482.65 payout', source: '46 conversions from 56 clicks', badge: 'green' },
      { time: 'Jan 27', plan: '$389.39 payout', source: '55 conversions from 70 clicks', badge: 'blue' },
    ],

    // Monthly breakdown for reference
    _monthlyData: {
      '2025-02': { clicks: 4593, conversions: 2174, payout: 19174.09, revenue: 31958.33 },
      '2025-03': { clicks: 4212, conversions: 2115, payout: 18678.25, revenue: 31130.42 },
      '2025-04': { clicks: 3362, conversions: 1958, payout: 18078.71, revenue: 30131.17 },
      '2025-05': { clicks: 2710, conversions: 1790, payout: 17916.02, revenue: 29860.03 },
      '2025-06': { clicks: 3241, conversions: 1881, payout: 16069.22, revenue: 26781.99 },
      '2025-07': { clicks: 3820, conversions: 2102, payout: 14967.08, revenue: 24945.10 },
      '2025-08': { clicks: 3357, conversions: 2129, payout: 14909.55, revenue: 24849.22 },
      '2025-09': { clicks: 3205, conversions: 2105, payout: 14960.05, revenue: 24933.39 },
      '2025-10': { clicks: 2633, conversions: 1983, payout: 14823.32, revenue: 24705.54 },
      '2025-11': { clicks: 1892, conversions: 1785, payout: 15391.03, revenue: 25651.74 },
      '2025-12': { clicks: 1722, conversions: 1650, payout: 15052.64, revenue: 25087.81 },
      '2026-01': { clicks: 2296, conversions: 1784, payout: 16234.96, revenue: 27058.28 },
      '2026-02': { clicks: 708, conversions: 425, payout: 2505.96, revenue: 4176.60 },
    },
  },

};

// Helper: get partner config from URL param, default to yourivanhofwegen
function getPartnerSlug() {
  const params = new URLSearchParams(window.location.search);
  return params.get('partner') || 'yourivanhofwegen';
}

function getPartnerConfig() {
  const slug = getPartnerSlug();
  return PARTNERS[slug] || PARTNERS['yourivanhofwegen'];
}
