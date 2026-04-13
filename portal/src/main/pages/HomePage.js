/**
 * HomePage — Landing page after login
 *
 * Demonstrates:
 *   - Basic Page with a Mustache template
 *   - Accessing the app instance via this.getApp()
 *   - Using onEnter() for per-visit logic (runs every time the page is shown)
 *   - Navigating to other pages via app.showPage()
 */

import { Page } from 'web-mojo';

export default class HomePage extends Page {
  constructor(options = {}) {
    super({
      pageName: 'HomePage',
      title: 'Home',
      icon: 'bi-house',
      ...options,
    });
  }

  async getTemplate() {
    return `
      <div class="container-lg py-4">
        <div class="text-center py-5">
          <i class="bi bi-grid-1x2 display-1 text-primary mb-3"></i>
          <h2>Welcome, {{userName}}</h2>
          <p class="text-muted">Select a group from the sidebar to get started.</p>
          <button class="btn btn-primary" data-action="selectGroup">
            <i class="bi bi-collection me-2"></i>Select Group
          </button>
        </div>
      </div>
    `;
  }

  onEnter() {
    const app = this.getApp();
    this.userName = app.activeUser?.display_name || 'there';

    // If user already has an active group, show that group's sidebar
    if (app.activeGroup) {
      app.sidebar.showMenuForGroup(app.activeGroup);
    }
  }

  onActionSelectGroup() {
    this.getApp().sidebar.showGroupSearch();
  }
}
