/**
 * Admin Scope — Sidebar Menu
 *
 * Global admin menu (not group-scoped). Shown when the user clicks
 * the gear icon in the top bar. The "Exit" item returns to the
 * active group's menu or opens the group search dialog.
 */

export function registerAdminMenu(app) {
  app.sidebar.addMenu('admin', {
    name: 'admin',
    className: 'sidebar sidebar-light sidebar-admin',

    header: `<div class="pt-3 text-center fs-5 fw-bold">
      <i class="bi bi-wrench pe-2"></i> Admin
    </div>`,

    items: [
      { kind: 'label', text: 'Management', className: 'mt-3' },

      {
        icon: 'bi-people',
        text: 'All Contacts',
        route: '?page=admin/contacts',
        permissions: app.getPagePermissions('admin/contacts'),
      },

      // Add more admin pages here as your project grows.
      // Example:
      // {
      //   icon: 'bi-bar-chart',
      //   text: 'Analytics',
      //   route: '?page=admin/analytics',
      //   permissions: app.getPagePermissions('admin/analytics'),
      // },

      { spacer: true },

      {
        text: 'Exit Admin',
        action: 'exit_admin',
        icon: 'bi-arrow-bar-left',
        handler: async () => {
          if (app.activeGroup) {
            app.sidebar.showMenuForGroup(app.activeGroup);
          } else {
            app.sidebar.showGroupSearch();
          }
        },
      },
    ],
  });
}
