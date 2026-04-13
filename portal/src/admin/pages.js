/**
 * Admin Scope — Page Registration
 *
 * These pages are NOT group-scoped. They provide a global view
 * across all groups (e.g. searching all contacts system-wide).
 */

import ContactsAdminPage from './pages/ContactsAdminPage.js';

export function registerAdminScopePages(app) {
  app.registerPage('admin/contacts', ContactsAdminPage, {
    route: 'admin/contacts',
    permissions: ['view_admin'],
  });
}
