/**
 * DashboardPage — Group-scoped metrics dashboard
 *
 * Demonstrates:
 *   - Page with child Views (composition via addChild + data-container)
 *   - Fetching data with app.rest.GET()
 *   - MetricsMiniChartWidget from web-mojo/charts
 *   - Action handlers (data-action → onAction*)
 *   - Refresh pattern with Promise.allSettled()
 *   - Group context via this.getApp().getActiveGroup()
 */

import { Page, View } from 'web-mojo';
import { MetricsMiniChartWidget } from 'web-mojo/charts';

/**
 * Stats cards header — a child View with its own template and data loading.
 * The parent DashboardPage adds this via addChild() with a containerId.
 */
class StatsHeaderView extends View {
  constructor(options = {}) {
    super({
      className: 'stats-header-section',
      ...options,
    });

    this.stats = {
      total_items: 0,
      active_items: 0,
      new_today: 0,
    };
  }

  async getTemplate() {
    return `
      <div class="row mb-4">
        <div class="col-xl-4 col-lg-6 col-12 mb-3">
          <div class="card h-100 border-0 shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <h6 class="card-title text-muted mb-2">Total Contacts</h6>
                  <h3 class="mb-0 fw-bold">{{stats.total_items}}</h3>
                </div>
                <div class="text-primary">
                  <i class="bi bi-people fs-2"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-4 col-lg-6 col-12 mb-3">
          <div class="card h-100 border-0 shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <h6 class="card-title text-muted mb-2">Active</h6>
                  <h3 class="mb-0 fw-bold">{{stats.active_items}}</h3>
                </div>
                <div class="text-success">
                  <i class="bi bi-check-circle fs-2"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-4 col-lg-6 col-12 mb-3">
          <div class="card h-100 border-0 shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <h6 class="card-title text-muted mb-2">New Today</h6>
                  <h3 class="mb-0 fw-bold">{{stats.new_today}}</h3>
                </div>
                <div class="text-info">
                  <i class="bi bi-plus-circle fs-2"></i>
                </div>
              </div>
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
      const resp = await this.getApp().rest.GET(
        `/api/myapp/contact?group=${group.id}&size=0`
      );
      if (resp?.data) {
        this.stats.total_items = resp.data.count || 0;
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }

  async refresh() {
    await this.loadStats();
    await this.render();
  }
}


/**
 * Main Dashboard Page
 */
export default class DashboardPage extends Page {
  constructor(options = {}) {
    super({
      pageName: 'DashboardPage',
      title: 'Dashboard',
      icon: 'bi-speedometer2',
      ...options,
    });
  }

  async getTemplate() {
    return `
      <div class="dashboard-container container-lg">
        <!-- Page Header -->
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div>
            <p class="text-muted mb-0">Activity overview for your group</p>
          </div>
          <button class="btn btn-outline-secondary btn-sm" data-action="refreshAll">
            <i class="bi bi-arrow-clockwise"></i> Refresh
          </button>
        </div>

        <!-- Stats Cards (child View) -->
        <div data-container="stats-header"></div>

        <!-- Metric Charts -->
        <div class="row">
          <div class="col-lg-6 col-12 mb-4">
            <div data-container="chart-created"></div>
          </div>
          <div class="col-lg-6 col-12 mb-4">
            <div data-container="chart-active"></div>
          </div>
        </div>

        <!-- Footer -->
        <div class="text-muted small text-end">
          Last updated: {{lastUpdated}}
        </div>
      </div>
    `;
  }

  async onInit() {
    this.lastUpdated = new Date().toLocaleString();

    // Child view: stats cards
    this.statsHeader = new StatsHeaderView({
      containerId: 'stats-header',
    });
    this.addChild(this.statsHeader);

    // Metric chart: contacts created over time
    // These use the built-in django-mojo metrics engine.
    // Slugs must match metrics you emit from your backend.
    this.chartCreated = new MetricsMiniChartWidget({
      icon: 'bi bi-plus-circle',
      title: 'Contacts Created',
      subtitle: '{{now_value}} Today <span class="ms-2">{{total}} Last 30 Days</span>',
      background: '#0F75E0',
      textColor: '#FFFFFF',
      endpoint: '/api/metrics/fetch',
      granularity: 'days',
      slugs: ['contacts_created'],
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
      containerId: 'chart-created',
    });
    this.addChild(this.chartCreated);

    this.chartActive = new MetricsMiniChartWidget({
      icon: 'bi bi-check-circle',
      title: 'Active Contacts',
      subtitle: '{{now_value}} Today <span class="ms-2">{{total}} Last 30 Days</span>',
      background: '#228B59',
      textColor: '#FFFFFF',
      endpoint: '/api/metrics/fetch',
      granularity: 'days',
      slugs: ['contacts_active'],
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
      containerId: 'chart-active',
    });
    this.addChild(this.chartActive);
  }

  async onBeforeRender() {
    // Update chart account to current group on every render
    const group = this.getApp().getActiveGroup();
    const account = `group-${group.id}`;

    this.chartCreated.account = account;
    this.chartCreated.chartOptions.account = account;

    this.chartActive.account = account;
    this.chartActive.chartOptions.account = account;
  }

  async onActionRefreshAll(event, element) {
    try {
      const icon = element?.querySelector('i');
      icon?.classList.add('bi-spin');
      if (element) element.disabled = true;

      await Promise.allSettled([
        this.statsHeader?.refresh(),
        this.chartCreated?.refresh(),
        this.chartActive?.refresh(),
      ].filter(Boolean));

      this.lastUpdated = new Date().toLocaleString();
      await this.render();
    } finally {
      const icon = element?.querySelector('i');
      icon?.classList.remove('bi-spin');
      if (element) element.disabled = false;
    }
  }
}
