---
name: charts-and-metrics
description: Comprehensive reference for MetricsMiniChartWidget, MiniChart, SeriesChart, PieChart, CircularProgress, and dashboard patterns in web-mojo
---

You are an expert on the web-mojo chart and metrics extensions. Use this reference when building dashboards, metric displays, or any chart-based UI.

## Import

```javascript
// Most common — widget card with embedded chart
import { MetricsMiniChartWidget } from 'web-mojo/charts';

// Full Chart.js-based charts
import { SeriesChart, PieChart, MetricsChart } from 'web-mojo/charts';

// Lightweight SVG charts (no Chart.js dependency)
import { MiniChart, MiniSeriesChart, MiniPieChart } from 'web-mojo/charts';

// Progress indicator
import { CircularProgress } from 'web-mojo/charts';
```

---

## MetricsMiniChartWidget — Dashboard Metric Cards

The most commonly used component for admin dashboards. Renders a Bootstrap card with header, subtitle, and embedded sparkline chart.

```javascript
this.chart = new MetricsMiniChartWidget({
  containerId: 'chart-revenue',

  // ── Display ─────────────────────────────────────────
  icon: 'bi bi-credit-card-fill',
  title: 'Revenue',
  subtitle: '{{now_value}} Today <span class="ms-2">{{total}} Last 30 Days</span>',
  background: '#0F75E0',           // Card background color
  textColor: '#FFFFFF',            // Text color

  // ── Metrics API ─────────────────────────────────────
  endpoint: '/api/metrics/fetch',  // django-mojo metrics endpoint
  account: 'group-',              // Account prefix (group ID appended dynamically)
  granularity: 'days',            // 'minutes', 'hours', 'days', 'weeks', 'months'
  slugs: ['revenue_total'],       // Metric slug(s) from backend
  // category: null,              // Optional category filter
  // dateStart: null,             // Custom start date
  // dateEnd: null,               // Custom end date
  // defaultDateRange: '30d',     // Quick range: '1h', '24h', '7d', '30d'
  // refreshInterval: 30000,      // Auto-refresh interval (ms)

  // ── Chart Options ───────────────────────────────────
  chartType: 'line',              // 'line' or 'bar'
  showTooltip: true,
  height: 50,
  chartWidth: '100%',
  color: 'rgba(245, 245, 255, 0.8)',
  fill: true,
  fillColor: 'rgba(245, 245, 255, 0.6)',
  smoothing: 0.3,                 // Curve smoothing (0-1)
  strokeWidth: 2,
  // showDots: false,
  // dotRadius: 2,

  // ── Trending ────────────────────────────────────────
  showTrending: true,             // Show % change indicator
  // trendRange: 2,               // Window size for trend calc
  // trendOffset: 0,              // Offset from latest value

  // ── Settings Panel ──────────────────────────────────
  // showSettings: true,          // Gear icon for granularity/date settings
  // settingsKey: 'chart-rev',    // localStorage key for persistence

  // ── Toolbar ─────────────────────────────────────────
  // showRefresh: true,           // Refresh button
});
this.addChild(this.chart);
```

### Subtitle Template Variables

The subtitle supports Mustache with these auto-populated values:

| Variable | Description |
|----------|-------------|
| `{{total}}` | Sum of all data points |
| `{{now_value}}` | Latest data point value |
| `{{now_label}}` | Period label (e.g., "Today") |
| `{{total_label}}` | Period summary label |

### Dynamic Account Updates

For group-scoped metrics, update the account when the group changes:

```javascript
async onBeforeRender() {
  const group = this.getApp().getActiveGroup();
  const account = `group-${group.id}`;
  this.chart.account = account;
  this.chart.chartOptions.account = account;
}
```

### Granularity Auto-Adjustment

When granularity changes, the date range adjusts automatically:

| Granularity | Default Range |
|-------------|---------------|
| `minutes` | 1 hour |
| `hours` | 24 hours |
| `days` | 30 days |
| `weeks` | 12 weeks |
| `months` | 12 months |

---

## Dashboard Page Pattern

Complete example using MetricsMiniChartWidget in a dashboard:

```javascript
import { Page, View } from 'web-mojo';
import { MetricsMiniChartWidget } from 'web-mojo/charts';

class StatsView extends View {
  constructor(options = {}) {
    super(options);
    this.stats = { total: 0, active: 0, rate: '0%' };
  }

  async getTemplate() {
    return `
      <div class="row mb-4">
        <div class="col-xl-4 col-lg-6 col-12 mb-3">
          <div class="card h-100 border-0 shadow-sm">
            <div class="card-body">
              <h6 class="text-muted mb-2">Total</h6>
              <h3 class="fw-bold">{{stats.total|number}}</h3>
            </div>
          </div>
        </div>
        <!-- more stat cards... -->
      </div>
    `;
  }

  async onBeforeRender() {
    const group = this.getApp().getActiveGroup();
    const resp = await this.getApp().rest.GET('/api/myapp/stats', { group: group.id });
    if (resp?.data?.data) Object.assign(this.stats, resp.data.data);
  }

  async refresh() {
    await this.loadStats();
    await this.render();
  }
}

export default class DashboardPage extends Page {
  constructor(options = {}) {
    super({
      pageName: 'dashboard',
      title: 'Dashboard',
      icon: 'bi-speedometer2',
      ...options,
    });
  }

  async getTemplate() {
    return `
      <div class="container-lg">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <p class="text-muted mb-0">Overview for {{groupName}}</p>
          <button class="btn btn-outline-secondary btn-sm" data-action="refreshAll">
            <i class="bi bi-arrow-clockwise"></i> Refresh
          </button>
        </div>
        <div data-container="stats"></div>
        <div class="row">
          <div class="col-lg-6 mb-4"><div data-container="chart-1"></div></div>
          <div class="col-lg-6 mb-4"><div data-container="chart-2"></div></div>
        </div>
      </div>
    `;
  }

  async onInit() {
    this.statsView = new StatsView({ containerId: 'stats' });
    this.addChild(this.statsView);

    this.chart1 = new MetricsMiniChartWidget({
      icon: 'bi bi-plus-circle',
      title: 'Items Created',
      subtitle: '{{now_value}} Today <span class="ms-2">{{total}} Last 30 Days</span>',
      background: '#0F75E0',
      textColor: '#FFFFFF',
      endpoint: '/api/metrics/fetch',
      granularity: 'days',
      slugs: ['items_created'],
      account: 'group-',
      chartType: 'line',
      showTooltip: true,
      height: 50,
      chartWidth: '100%',
      color: 'rgba(245, 245, 255, 0.8)',
      fill: true,
      fillColor: 'rgba(245, 245, 255, 0.6)',
      smoothing: 0.3,
      showTrending: true,
      containerId: 'chart-1',
    });
    this.addChild(this.chart1);

    this.chart2 = new MetricsMiniChartWidget({
      icon: 'bi bi-check-circle',
      title: 'Completed',
      subtitle: '{{now_value}} Today <span class="ms-2">{{total}} Last 30 Days</span>',
      background: '#228B59',
      textColor: '#FFFFFF',
      endpoint: '/api/metrics/fetch',
      granularity: 'days',
      slugs: ['items_completed'],
      account: 'group-',
      chartType: 'line',
      showTooltip: true,
      height: 50,
      chartWidth: '100%',
      color: 'rgba(245, 245, 255, 0.8)',
      fill: true,
      fillColor: 'rgba(245, 245, 255, 0.6)',
      smoothing: 0.3,
      showTrending: true,
      containerId: 'chart-2',
    });
    this.addChild(this.chart2);
  }

  async onBeforeRender() {
    const group = this.getApp().getActiveGroup();
    this.groupName = group?.name || 'your group';
    const account = `group-${group.id}`;
    [this.chart1, this.chart2].forEach(chart => {
      chart.account = account;
      chart.chartOptions.account = account;
    });
  }

  async onActionRefreshAll(event, element) {
    const icon = element?.querySelector('i');
    icon?.classList.add('bi-spin');
    await Promise.allSettled([
      this.statsView?.refresh(),
      this.chart1?.refresh(),
      this.chart2?.refresh(),
    ].filter(Boolean));
    this.lastUpdated = new Date().toLocaleString();
    await this.render();
    icon?.classList.remove('bi-spin');
  }
}
```

---

## MiniChart — Lightweight SVG Sparkline

Pure SVG, no Chart.js dependency. For embedding in cards, table cells, or detail views.

```javascript
new MiniChart({
  data: [10, 15, 12, 20, 18, 25],
  chartType: 'line',              // 'line' or 'bar'
  width: '100%',
  height: 30,
  color: 'rgba(54, 162, 235, 1)',
  fillColor: 'rgba(54, 162, 235, 0.1)',
  fill: true,
  smoothing: 0.3,
  strokeWidth: 2,
  showTooltip: true,
  containerId: 'sparkline',
});
```

---

## SeriesChart — Full Line/Bar Chart

Chart.js-based multi-series chart with controls.

```javascript
new SeriesChart({
  containerId: 'sales-chart',
  title: 'Sales Performance',
  chartType: 'line',              // 'line' or 'bar'
  showTypeSwitch: true,           // Toggle line/bar
  stacked: false,
  height: 400,

  xAxis: { field: 'date', formatter: 'date:MMM YYYY', label: 'Month' },
  yAxis: { field: 'value', formatter: 'currency:USD', label: 'Revenue', beginAtZero: true },

  tooltip: {
    x: 'date:MMM DD, YYYY',
    y: 'currency:USD:2',
  },

  data: {
    labels: ['Jan', 'Feb', 'Mar'],
    datasets: [
      { label: 'Revenue', data: [15000, 18000, 22000] },
      { label: 'Expenses', data: [12000, 13000, 14000] },
    ],
  },
});
```

---

## PieChart — Interactive Pie/Doughnut

```javascript
new PieChart({
  containerId: 'pie-chart',
  title: 'Market Share',
  cutout: 0,                      // 0=pie, 0.5=doughnut
  showLabels: true,
  clickable: true,

  data: [
    { category: 'Desktop', amount: 45000 },
    { category: 'Mobile', amount: 38000 },
    { category: 'Tablet', amount: 17000 },
  ],

  labelField: 'category',
  valueField: 'amount',
  valueFormatter: 'percent:1',
});
```

---

## CircularProgress — Progress Indicator

```javascript
new CircularProgress({
  containerId: 'progress',
  value: 75,
  min: 0,
  max: 100,
  size: 'md',                    // 'xs', 'sm', 'md', 'lg', 'xl' or pixel number
  variant: 'success',            // 'default', 'success', 'danger', 'warning', 'info'
  showValue: true,
  valueFormat: 'percentage',     // 'percentage', 'fraction', 'value'
  label: 'Complete',
  animate: true,
  rounded: true,

  // Multi-segment
  // segments: [
  //   { value: 30, color: '#198754', label: 'Done' },
  //   { value: 20, color: '#ffc107', label: 'In Progress' },
  // ],
});
```

Methods: `setValue(85)`, `increment(5)`, `decrement(5)`, `complete()`, `reset()`, `pulse()`.

---

## MetricsChart — Full Chart with API Integration

Full Chart.js chart that fetches from the metrics API with granularity controls.

```javascript
new MetricsChart({
  containerId: 'metrics-chart',
  title: 'API Calls',
  endpoint: '/api/metrics/fetch',
  account: 'global',
  granularity: 'hours',
  slugs: ['api_calls', 'api_errors'],
  chartType: 'line',
  height: 400,
  showGranularity: true,          // Granularity dropdown
  showDateRange: true,            // Date range controls
  showLegend: true,
});
```

---

## Account Patterns

| Account | Scope |
|---------|-------|
| `'global'` | System-wide metrics |
| `'group-{id}'` | Group-specific |
| `'user-{id}'` | User-specific |

---

## Color Palettes

### MetricsMiniChartWidget (Card Backgrounds)

Common background/text combinations:
```javascript
{ background: '#0F75E0', textColor: '#FFFFFF' }  // Blue
{ background: '#228B59', textColor: '#FFFFFF' }  // Green
{ background: '#F3465D', textColor: '#FFFFFF' }  // Red
{ background: '#F0A030', textColor: '#FFFFFF' }  // Orange
{ background: '#7C3AED', textColor: '#FFFFFF' }  // Purple
{ background: '#1E293B', textColor: '#FFFFFF' }  // Dark
```

Chart color over colored background: `rgba(245, 245, 255, 0.8)` line, `rgba(245, 245, 255, 0.6)` fill.

### SeriesChart Default Palette

```javascript
'rgba(52, 152, 219, 0.85)',   // Blue
'rgba(231, 76, 60, 0.85)',    // Red
'rgba(46, 204, 113, 0.85)',   // Green
'rgba(241, 196, 15, 0.85)',   // Yellow
'rgba(155, 89, 182, 0.85)',   // Purple
'rgba(230, 126, 34, 0.85)',   // Orange
```

---

## Chart Events

```javascript
chart.on('metrics:loaded', () => {})        // Data loaded from API
chart.on('chart:error', (data) => {})       // API error
chart.on('chart:point-clicked', (data) => {})  // Data point clicked
chart.on('chart:type-changed', (data) => {})   // Line/bar toggled
```

---

## Metrics API Contract

**Request:** `GET /api/metrics/fetch?granularity=hours&account=group-123&slugs[]=items_created&with_labels=true&dr_start=...&dr_end=...`

**Response:**
```json
{
  "status": true,
  "data": {
    "labels": ["2026-04-12 10:00", "2026-04-12 11:00"],
    "data": {
      "items_created": [10, 15]
    }
  }
}
```
