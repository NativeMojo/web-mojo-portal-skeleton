/**
 * Portal — Main Application Bootstrap
 *
 * This file creates the PortalWebApp, registers all pages and menus,
 * then starts the app. Pages are registered BEFORE menus so that
 * menu items can use app.getPagePermissions() to sync visibility.
 */

import { PortalWebApp } from 'web-mojo';
import { registerAdminPages, registerAssistant } from 'web-mojo/admin';
import config from './config.js';
import { VERSION_INFO } from './version.js';

// Page registrars (one per menu section)
import { registerMainPages } from './main/pages.js';
import { registerAdminScopePages } from './admin/pages.js';

// Menu registrars
import { registerMainMenu } from './main/menu.js';
import { registerAdminMenu } from './admin/menu.js';

// Import model views so VIEW_CLASS bindings execute on startup
import './main/views/ContactView.js';

// ── Create App ──────────────────────────────────────────────────────────────

const app = new PortalWebApp({
  name: config.name,
  version: VERSION_INFO.full,
  basePath: config.basePath,
  layout: 'portal',
  container: '#app',

  api: {
    baseUrl: config.apiURL,
    timeout: config.apiTimeout,
  },

  auth: {
    loginUrl: config.authURL,
    redirectDelay: 4000,
  },

  // Enable realtime WebSocket (connects automatically after auth)
  ws: true,

  brand: config.brand,
  brandIcon: config.brandIcon,

  topbar: {
    brand: config.brand,
    brandIcon: config.brandIcon,
    brandRoute: `?page=${config.defaultRoute}`,
    theme: 'light',
    displayMode: 'both',
    showSidebarToggle: true,

    // Top-right quick-access buttons
    rightItems: [
      {
        id: 'admin',
        icon: 'bi-gear-fill',
        tooltip: 'Admin',
        action: 'admin-menu',
        permissions: 'view_admin',
        handler: () => app.sidebar.setActiveMenu('admin'),
      },
    ],

    // User dropdown
    userMenu: {
      label: 'User',
      icon: 'bi-person-circle',
      items: [
        { label: 'Profile', icon: 'bi-person', action: 'profile' },
        { divider: true },
        { label: 'Change Password', icon: 'bi-shield-lock', action: 'change-password' },
        { divider: true },
        { label: 'Logout', icon: 'bi-box-arrow-right', action: 'logout' },
      ],
    },
  },

  sidebar: {
    shadow: null,
    groupSelectorMode: 'dialog',
  },

  defaultRoute: config.defaultRoute,
});

// ── Bootstrap ───────────────────────────────────────────────────────────────

async function bootstrap() {
  console.log(`%c${config.name} v${VERSION_INFO.full}`, 'font-weight: bold; font-size: 14px;');

  try {
    // 1. Register pages first (permissions needed by menus)
    registerMainPages(app);
    registerAdminScopePages(app);

    // Register built-in web-mojo admin pages (users, groups, jobs, etc.)
    await registerAdminPages(app);
    registerAssistant(app);

    // 2. Register menus (after pages so getPagePermissions works)
    registerMainMenu(app);
    registerAdminMenu(app);

    // 3. Start
    const result = await app.start();
    if (result.success) {
      console.log('Portal started successfully');
    }
  } catch (error) {
    console.error('Failed to start portal:', error);
    document.getElementById('app').innerHTML = `
      <div class="container mt-5">
        <div class="alert alert-danger">
          <h4 class="alert-heading">Application Error</h4>
          <p>Failed to start the portal application.</p>
          <hr>
          <p class="mb-0"><small>${error.message}</small></p>
        </div>
      </div>
    `;
  }
}

// Export for console debugging
window.app = app;

bootstrap();
