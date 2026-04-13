/**
 * Main Scope — Sidebar Menu
 *
 * The default group-scoped sidebar. Shown when a group is selected.
 * groupKind: 'any' means this menu applies to all group types.
 *
 * Menu items use app.getPagePermissions(route) to automatically sync
 * with the permissions defined when the page was registered.
 * Items are hidden from users who lack the required permissions.
 */

export function registerMainMenu(app) {
  app.sidebar.addMenu('default', {
    name: 'default',
    groupKind: 'any',
    className: 'sidebar sidebar-dark',

    items: [
      { kind: 'label', text: 'Overview', className: 'mt-3' },

      {
        icon: 'bi-speedometer2',
        text: 'Dashboard',
        route: '?page=group/dashboard',
        permissions: app.getPagePermissions('group/dashboard'),
      },

      { kind: 'label', text: 'Data', className: 'mt-3' },

      {
        icon: 'bi-people',
        text: 'Contacts',
        route: '?page=group/contacts',
        permissions: app.getPagePermissions('group/contacts'),
      },

      { kind: 'label', text: 'Configuration', className: 'mt-3' },

      {
        icon: 'bi-gear',
        text: 'Settings',
        route: '?page=group/settings',
        permissions: app.getPagePermissions('group/settings'),
      },

      // ── Add more menu sections here ──────────────────────────────────
      // { kind: 'label', text: 'Reports', className: 'mt-3' },
      // {
      //   icon: 'bi-bar-chart',
      //   text: 'Analytics',
      //   route: '?page=group/analytics',
      //   permissions: app.getPagePermissions('group/analytics'),
      // },

      { spacer: true },
    ],
  });
}
