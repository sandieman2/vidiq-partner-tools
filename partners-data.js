/* ============================================
   vidIQ Partner Dashboard — Partner Data
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
  robertbenjamin: {
    name: 'Robert Benjamin',
    initials: 'RB',
    slug: 'robertbenjamin',
    url: 'vidiq.com/robertbenjamin',
    baseUrl: 'https://vidiq.com/robertbenjamin',

    kpi: {
      totalEarnings: { value: '$18,452<span style="font-size:16px">.30</span>', change: '↑ 42.5% all time', direction: 'up', color: 'var(--green)' },
      thisMonth:     { value: '$2,850<span style="font-size:16px">.00</span>', change: '↑ 11.8% vs last month', direction: 'up' },
      activeSubs:    { value: '487', change: '↑ 38 this month', direction: 'up' },
      newSignups:    { value: '142', change: '↑ 15.4% vs last month', direction: 'up' },
      conversionRate:{ value: '8.2%', change: '↑ 0.5pp vs last month', direction: 'up' },
      churnRate:     { value: '2.8%', change: '↓ 0.2pp vs last month', direction: 'up', color: 'var(--danger)' },
    },

    MONTHS: ['Feb \'25','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan \'26'],
    EARNINGS_DATA: [800, 950, 1100, 1280, 1450, 1680, 1850, 2050, 2280, 2480, 2680, 2850],
    NEW_REV: [480, 550, 620, 710, 800, 920, 1020, 1130, 1250, 1360, 1450, 1580],
    RECURRING_REV: [320, 400, 480, 570, 650, 760, 830, 920, 1030, 1120, 1230, 1270],

    FUNNEL_DATA: [
      { label: 'Clicks', value: 8520, color: '#3B82F6' },
      { label: 'Signups', value: 1820, color: '#8B5CF6' },
      { label: 'Trial', value: 1340, color: '#F59E0B' },
      { label: 'Paid', value: 890, color: '#00C853' },
      { label: 'Retained', value: 487, color: '#059669' },
    ],

    TOP_CONTENT: [
      { name: 'How to Go Viral on YouTube Shorts', conversions: 186 },
      { name: 'TikTok to YouTube — Complete Growth Strategy', conversions: 142 },
      { name: 'YouTube Shorts Algorithm Secrets 2025', conversions: 128 },
      { name: 'How I Grew to 500K on TikTok', conversions: 105 },
      { name: 'Short-Form Content Masterclass', conversions: 94 },
      { name: 'YouTube Shorts vs TikTok — Which Is Better?', conversions: 82 },
      { name: 'How to Get 1 Million Views on Shorts', conversions: 76 },
      { name: 'The Secret to YouTube Shorts Monetization', conversions: 68 },
    ],

    LINK_TABLE: [
      { name: 'How to Go Viral on YouTube Shorts', utm: 'youtube', clicks: 1850, signups: 420, conversions: 186, revenue: 5580 },
      { name: 'TikTok to YouTube — Complete Growth Strategy', utm: 'tiktok', clicks: 1620, signups: 350, conversions: 142, revenue: 4260 },
      { name: 'YouTube Shorts Algorithm Secrets 2025', utm: 'youtube', clicks: 1380, signups: 310, conversions: 128, revenue: 3840 },
      { name: 'How I Grew to 500K on TikTok', utm: 'tiktok', clicks: 1150, signups: 260, conversions: 105, revenue: 3150 },
      { name: 'Short-Form Content Masterclass', utm: 'youtube', clicks: 980, signups: 210, conversions: 94, revenue: 2820 },
      { name: 'YouTube Shorts vs TikTok — Which Is Better?', utm: 'youtube', clicks: 820, signups: 175, conversions: 82, revenue: 2460 },
      { name: 'How to Get 1 Million Views on Shorts', utm: 'youtube', clicks: 680, signups: 140, conversions: 76, revenue: 2280 },
      { name: 'The Secret to YouTube Shorts Monetization', utm: 'youtube', clicks: 540, signups: 115, conversions: 68, revenue: 2040 },
      { name: 'YouTube Shorts Hashtag Strategy', utm: 'instagram', clicks: 420, signups: 85, conversions: 42, revenue: 1260 },
      { name: 'My Shorts Workflow — Behind the Scenes', utm: 'youtube', clicks: 380, signups: 72, conversions: 35, revenue: 1050 },
    ],

    CUSTOMER_BREAKDOWN: [
      { status: 'Recurring', count: 345, mrr: 10350, pct: 70.8 },
      { status: 'New', count: 142, mrr: 4260, pct: 29.2 },
      { status: 'Churned', count: 14, mrr: -420, pct: 2.8 },
    ],

    RECENT_CONVERSIONS: [
      { time: '5 min ago', plan: 'Pro Monthly', source: 'How to Go Viral on YouTube Shorts', badge: 'green' },
      { time: '12 min ago', plan: 'Boost Monthly', source: 'TikTok to YouTube — Complete Growth Strategy', badge: 'blue' },
      { time: '28 min ago', plan: 'Pro Monthly', source: 'YouTube Shorts Algorithm Secrets 2025', badge: 'green' },
      { time: '41 min ago', plan: 'Pro Annual', source: 'How I Grew to 500K on TikTok', badge: 'green' },
      { time: '55 min ago', plan: 'Boost Monthly', source: 'Short-Form Content Masterclass', badge: 'blue' },
      { time: '1 hr ago', plan: 'Pro Monthly', source: 'YouTube Shorts vs TikTok — Which Is Better?', badge: 'green' },
      { time: '2 hr ago', plan: 'Max Monthly', source: 'How to Get 1 Million Views on Shorts', badge: 'yellow' },
      { time: '3 hr ago', plan: 'Pro Monthly', source: 'The Secret to YouTube Shorts Monetization', badge: 'green' },
      { time: '4 hr ago', plan: 'Boost Annual', source: 'YouTube Shorts Hashtag Strategy', badge: 'blue' },
      { time: '5 hr ago', plan: 'Pro Monthly', source: 'My Shorts Workflow — Behind the Scenes', badge: 'green' },
    ],
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
