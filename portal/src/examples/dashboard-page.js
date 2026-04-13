/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DASHBOARD PAGE — Complete reference for metric/overview pages
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Dashboards use Page (not FormPage or TablePage) with child Views:
 *   - Custom View for stats cards
 *   - MetricsMiniChartWidget for metric charts
 *   - TableView for recent/highlighted records
 *
 * Key patterns:
 *   - Child views via addChild() + data-container
 *   - Data loading in onBeforeRender()
 *   - Refresh with Promise.allSettled()
 *   - Group context via this.getApp().getActiveGroup()
 */

import { Page, View, TableView } from 'web-mojo';
import { MetricsMiniChartWidget } from 'web-mojo/charts';

/**
 * Stats cards — a child View with its own data loading.
 */
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
              <h3 class="fw-bold">{{stats.total}}</h3>
            </div>
          </div>
        </div>
        <div class="col-xl-4 col-lg-6 col-12 mb-3">
          <div class="card h-100 border-0 shadow-sm">
            <div class="card-body">
              <h6 class="text-muted mb-2">Active</h6>
              <h3 class="fw-bold text-success">{{stats.active}}</h3>
            </div>
          </div>
        </div>
        <div class="col-xl-4 col-lg-6 col-12 mb-3">
          <div class="card h-100 border-0 shadow-sm">
            <div class="card-body">
              <h6 class="text-muted mb-2">Success Rate</h6>
              <h3 class="fw-bold text-primary">{{stats.rate}}</h3>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async onBeforeRender() {
    await this.loadStats();
  }

  async loadStats() {
    try {
      const group = this.getApp().getActiveGroup();
      const resp = await this.getApp().rest.GET('/api/myapp/stats', { group: group.id });
      if (resp?.data?.data) {
        Object.assign(this.stats, resp.data.data);
      }
    } catch (err) {
      console.error('Stats load failed:', err);
    }
  }

  async refresh() {
    await this.loadStats();
    await this.render();
  }
}


/**
 * Main dashboard page
 */
export default class MyDashboardPage extends Page {
  constructor(options = {}) {
    super({
      pageName: 'MyDashboardPage',
      title: 'Dashboard',
      icon: 'bi-speedometer2',
      ...options,
    });
  }

  async getTemplate() {
    return `
      <div class="dashboard-container container-lg">
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

        <div class="text-muted small text-end">Last updated: {{lastUpdated}}</div>
      </div>
    `;
  }

  async onInit() {
    this.lastUpdated = new Date().toLocaleString();

    // Stats cards
    this.statsView = new StatsView({ containerId: 'stats' });
    this.addChild(this.statsView);

    // Metric chart 1
    this.chart1 = new MetricsMiniChartWidget({
      icon: 'bi bi-plus-circle',
      title: 'Items Created',
      subtitle: '{{now_value}} Today <span class="ms-2">{{total}} Last 30 Days</span>',
      background: '#0F75E0',
      textColor: '#FFFFFF',
      endpoint: '/api/metrics/fetch',
      granularity: 'days',
      slugs: ['items_created'],        // Must match a metric slug from your backend
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

    // Metric chart 2
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

    // Update chart accounts to current group
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
