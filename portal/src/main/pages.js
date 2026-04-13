/**
 * Main Scope — Page Registration
 *
 * Register all group-scoped pages. Each page gets:
 *   - A unique route (used in sidebar menu links and browser URL)
 *   - Permissions array (user needs ANY of these to access the page)
 *   - requiresGroup: true means the page won't load without an active group
 *
 * Import model view files here so their VIEW_CLASS bindings execute.
 * This ensures that when a TablePage row is clicked, the framework
 * knows which View to use for that model.
 */

import HomePage from './pages/HomePage.js';
import DashboardPage from './pages/DashboardPage.js';
import ContactsPage from './pages/ContactsPage.js';
import SettingsPage from './pages/SettingsPage.js';

// Import views to register VIEW_CLASS bindings
import './views/ContactView.js';

export function registerMainPages(app) {
  // Home — no permissions, no group required (landing page)
  app.registerPage('home', HomePage);

  // Dashboard
  app.registerPage('group/dashboard', DashboardPage, {
    route: 'group/dashboard',
    permissions: ['view_contacts', 'manage_contacts', 'sys.manage_groups'],
    requiresGroup: true,
  });

  // Contacts table
  app.registerPage('group/contacts', ContactsPage, {
    route: 'group/contacts',
    permissions: ['view_contacts', 'manage_contacts', 'sys.manage_groups'],
    requiresGroup: true,
  });

  // Settings (FormPage)
  app.registerPage('group/settings', SettingsPage, {
    route: 'group/settings',
    permissions: ['manage_group', 'sys.manage_groups'],
    requiresGroup: true,
  });
}
