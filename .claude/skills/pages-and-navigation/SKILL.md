---
name: pages-and-navigation
description: Comprehensive reference for registering pages, configuring sidebar menus, topbar, permissions, routing, and navigation in web-mojo portals
---

You are an expert on the web-mojo page registration, sidebar menu, topbar, and navigation system. Use this reference when adding new pages, configuring menus, or setting up navigation.

## Adding a New Page — Complete Workflow

### Step 1: Create the Page Class

```javascript
// portal/src/main/pages/ReportsPage.js
import { TablePage } from 'web-mojo';
import { ReportList } from '../../models/Report.js';

export default class ReportsPage extends TablePage {
  constructor(options = {}) {
    super({
      pageName: 'ReportsPage',
      title: 'Reports',
      icon: 'bi-bar-chart',
      Collection: ReportList,
      // ...columns, etc.
      ...options,
    });
  }
}
```

### Step 2: Register the Page

```javascript
// portal/src/main/pages.js
import ReportsPage from './pages/ReportsPage.js';

export function registerMainPages(app) {
  // ... existing registrations ...

  app.registerPage('group/reports', ReportsPage, {
    route: 'group/reports',
    permissions: ['view_reports', 'manage_reports', 'sys.manage_groups'],
    requiresGroup: true,
  });
}
```

### Step 3: Add to Sidebar Menu

```javascript
// portal/src/main/menu.js
export function registerMainMenu(app) {
  app.sidebar.addMenu('default', {
    name: 'default',
    groupKind: 'any',
    items: [
      // ... existing items ...

      { kind: 'label', text: 'Analytics', className: 'mt-3' },
      {
        icon: 'bi-bar-chart',
        text: 'Reports',
        route: '?page=group/reports',
        permissions: app.getPagePermissions('group/reports'),
      },
    ],
  });
}
```

### Step 4: Bootstrap (already done once in portal.js)

```javascript
// portal/src/portal.js — registration order matters!
registerMainPages(app);      // 1. Register pages FIRST
registerAdminPages(app);
registerMainMenu(app);       // 2. Register menus SECOND (so they can read page permissions)
registerAdminMenu(app);
await app.start();           // 3. Start the app
```

---

## Page Registration

```javascript
app.registerPage(pageName, PageClass, options)
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pageName` | string | Yes | Unique page identifier, used in URLs |
| `PageClass` | class | Yes | Page/TablePage/FormPage class |
| `options.route` | string | No | URL route (defaults to `/{pageName}`) |
| `options.permissions` | string/string[] | No | Required permissions (user needs ANY of these) |
| `options.requiresGroup` | boolean | No | Page requires an active group |

### Page Name Conventions

| Pattern | Scope | Example |
|---------|-------|---------|
| `'home'` | Global, no group | Landing page |
| `'group/contacts'` | Group-scoped | Contacts for active group |
| `'group/settings'` | Group-scoped | Group settings |
| `'admin/contacts'` | Admin | Cross-group admin view |

### Permission Retrieval

Menus can sync with page permissions at registration time:

```javascript
// In menu config
permissions: app.getPagePermissions('group/reports'),
// Returns the same array passed during registerPage()
```

---

## Sidebar Menu Configuration

### Adding a Menu

```javascript
app.sidebar.addMenu('menu-name', {
  name: 'menu-name',              // Required: unique identifier
  groupKind: 'any',               // Show for any group type (or specific: 'organization')
  className: 'sidebar sidebar-dark',

  // Optional header/footer HTML
  header: '<div class="pt-3 text-center fw-bold">My Section</div>',
  footer: '<div class="text-center small text-muted">v1.0</div>',

  items: [ /* see Item Types below */ ],
});
```

### Menu Item Types

#### Route Item — Navigate to a page

```javascript
{
  icon: 'bi-speedometer2',
  text: 'Dashboard',
  route: '?page=group/dashboard',
  permissions: app.getPagePermissions('group/dashboard'),
  // Optional:
  badge: { text: 'NEW', class: 'badge bg-success' },
  tooltip: 'View dashboard',
  disabled: false,
}
```

#### Action Item — Execute a handler

```javascript
{
  icon: 'bi-arrow-bar-left',
  text: 'Exit Admin',
  action: 'exit_admin',
  handler: async () => {
    if (app.activeGroup) {
      app.sidebar.showMenuForGroup(app.activeGroup);
    } else {
      app.sidebar.showGroupSearch();
    }
  },
}
```

#### Submenu — Collapsible children

```javascript
{
  icon: 'bi-graph-up',
  text: 'Reports',
  children: [
    { text: 'Sales', route: '?page=group/sales-report', icon: 'bi-bar-chart' },
    { text: 'People', route: '?page=group/people-report', icon: 'bi-people' },
  ],
}
```

#### Label — Section heading

```javascript
{ kind: 'label', text: 'Data Management', className: 'mt-3' }
```

#### Divider — Horizontal rule

```javascript
{ divider: true }
```

#### Spacer — Push remaining items to bottom

```javascript
{ spacer: true }
```

### Group-Based Menu Switching

Menus can auto-activate based on the group's `kind`:

```javascript
// Shows only for organization groups
app.sidebar.addMenu('org-menu', {
  groupKind: 'organization',
  items: [
    { text: 'Members', route: '?page=group/members', icon: 'bi-people' },
  ],
});

// Shows for any group type (catch-all)
app.sidebar.addMenu('default', {
  groupKind: 'any',
  items: [
    { text: 'Dashboard', route: '?page=group/dashboard', icon: 'bi-speedometer2' },
  ],
});
```

### Sidebar Methods

```javascript
app.sidebar.addMenu('name', config)           // Add a menu
app.sidebar.updateMenu('name', { items })     // Update menu items
await app.sidebar.setActiveMenu('admin')      // Switch visible menu
app.sidebar.showMenuForGroup(group)           // Auto-select by group kind
app.sidebar.showGroupSearch()                 // Show group selection
app.sidebar.hasMenu('admin')                  // Check if menu exists
app.sidebar.collapse()                        // Collapse sidebar
app.sidebar.expand()                          // Expand sidebar
app.sidebar.toggleSidebar()                   // Toggle
```

---

## Topbar Configuration

Configured in the app constructor (portal.js):

```javascript
const app = new PortalWebApp({
  topbar: {
    brand: 'My Portal',
    brandIcon: 'bi-play-circle',
    brandRoute: '?page=home',
    theme: 'light',                    // 'light', 'dark', 'clean', 'gradient'
    displayMode: 'both',               // 'brand', 'page', 'both', 'group', 'group_page_titles'
    showSidebarToggle: true,
    showPageIcon: true,

    // Left-side nav items
    leftItems: [
      { text: 'Home', route: '?page=home', icon: 'bi-house' },
    ],

    // Right-side buttons and dropdowns
    rightItems: [
      {
        id: 'admin',
        icon: 'bi-gear-fill',
        tooltip: 'Admin',
        permissions: 'view_admin',
        handler: () => app.sidebar.setActiveMenu('admin'),
      },
    ],

    // User dropdown menu
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
});
```

### Right Item Types

#### Button

```javascript
{
  id: 'admin',
  icon: 'bi-gear-fill',
  tooltip: 'Admin Panel',
  permissions: 'view_admin',          // Hidden if user lacks permission
  buttonClass: 'btn btn-link text-white',
  handler: () => app.sidebar.setActiveMenu('admin'),
}
```

#### Dropdown Menu

```javascript
{
  id: 'tools',
  label: 'Tools',
  icon: 'bi-tools',
  items: [
    { label: 'Import', icon: 'bi-upload', action: 'import' },
    { label: 'Export', icon: 'bi-download', action: 'export' },
    { divider: true },
    { label: 'Settings', icon: 'bi-gear', action: 'settings' },
  ],
}
```

#### Group Selector

```javascript
{
  id: 'group-selector',
  type: 'group-selector',
  defaultText: 'Select Group',
  buttonClass: 'btn btn-outline-light btn-sm',
}
```

### Display Modes

| Mode | Shows |
|------|-------|
| `'brand'` | Logo + app name |
| `'page'` | Current page icon + title |
| `'both'` | Current page icon + title |
| `'group'` | Active group name |
| `'group_page_titles'` | Group name + page title |

### TopBar Methods

```javascript
app.topbar.setBrand('New Brand', 'bi-star');
app.topbar.setUser(userModel);
```

---

## Routing & Navigation

### URL Format

Routes use query parameter format:

```
?page=group/contacts&status=active&sort=-created
```

### Programmatic Navigation

```javascript
const app = this.getApp();

// Simple navigation
app.showPage('home');
app.showPage('group/contacts');

// With query params (appear in URL)
app.showPage('group/contacts', { status: 'active', sort: '-created' });

// With rich params (NOT in URL, passed to onParams)
app.showPage('group/detail', {}, { model: contactInstance });
```

### Template Navigation

```html
<a data-page="group/contacts">View Contacts</a>
<a data-page="group/detail" data-params='{"id": 123}'>Contact #123</a>
```

### Page Lifecycle on Navigation

1. `showPage()` called
2. Permission check → denied page if user lacks perms
3. Group check → error if `requiresGroup` and no active group
4. Old page: `onExit()` → unmount
5. New page: `onParams(params, query)` → `onEnter()` → render
6. Sidebar/topbar active states update

### Page Lifecycle Hooks

```javascript
class MyPage extends Page {
  // Called with URL params on every navigation to this page
  async onParams(params, query) {
    this.filter = query.status || 'all';
  }

  // Called each time the page becomes visible
  async onEnter() {
    await this.loadData();
  }

  // Called when leaving this page
  async onExit() {
    // Cleanup, save state
  }

  // Called when the active group changes
  async onGroupChange(group) {
    await this.loadData();
    await this.render();
  }
}
```

---

## Permissions

### How Permissions Work

- Pages declare required permissions at registration time.
- Menu items reference those permissions to auto-show/hide.
- User needs **ANY** of the listed permissions to access the page.
- Permissions come from the django-mojo User → Group → Member model.

### System Permissions

System-level permissions are prefixed with `sys.`:

```javascript
permissions: ['manage_contacts', 'sys.manage_groups']
// User with EITHER 'manage_contacts' OR 'sys.manage_groups' can access
```

### Checking Permissions

```javascript
const user = app.activeUser;
user.hasPermission('view_contacts');          // single
user.hasPermission(['view_contacts', 'manage_contacts']);  // all required
```

---

## Portal Actions

Topbar and sidebar items with `action` trigger the portal action system:

```javascript
// Built-in actions (handled automatically):
'logout'           // Clear tokens, redirect to login
'profile'          // Show user profile dialog
'change-password'  // Show change password dialog
'toggle-sidebar'   // Toggle sidebar collapse

// Custom actions use a handler:
{
  icon: 'bi-gear',
  text: 'Admin',
  action: 'admin-menu',
  handler: () => app.sidebar.setActiveMenu('admin'),
}
```

Listen for actions globally:

```javascript
app.events.on('portal:action', ({ action, ...data }) => {
  if (action === 'my-custom-action') {
    // handle it
  }
});
```

---

## Sidebar Auto-Switching

When navigating to a page, the sidebar automatically finds the right menu:

1. **`page.sidebarMenu`** — explicit override on the page class
2. **Route match** — if the new route exists in a menu's items
3. **Default menu** — fallback
4. **First visible menu** — last resort

Override example:

```javascript
class AdminDetailPage extends Page {
  sidebarMenu = 'admin';  // Always show admin menu for this page
}
```

---

## Complete Example: Adding a New Menu Section

```
portal/src/
  billing/
    menu.js
    pages.js
    pages/
      InvoicesPage.js
      BillingSettingsPage.js
    views/
      InvoiceView.js
```

### pages.js

```javascript
import InvoicesPage from './pages/InvoicesPage.js';
import BillingSettingsPage from './pages/BillingSettingsPage.js';

export function registerBillingPages(app) {
  app.registerPage('group/invoices', InvoicesPage, {
    route: 'group/invoices',
    permissions: ['view_billing', 'manage_billing'],
    requiresGroup: true,
  });

  app.registerPage('group/billing-settings', BillingSettingsPage, {
    route: 'group/billing-settings',
    permissions: ['manage_billing'],
    requiresGroup: true,
  });
}
```

### menu.js

```javascript
export function registerBillingMenu(app) {
  // Add items to existing 'default' menu
  // OR create a new menu for billing-type groups:
  app.sidebar.addMenu('billing', {
    name: 'billing',
    groupKind: 'billing_account',   // Only for groups of this kind
    items: [
      { kind: 'label', text: 'Billing' },
      {
        icon: 'bi-receipt',
        text: 'Invoices',
        route: '?page=group/invoices',
        permissions: app.getPagePermissions('group/invoices'),
      },
      {
        icon: 'bi-gear',
        text: 'Billing Settings',
        route: '?page=group/billing-settings',
        permissions: app.getPagePermissions('group/billing-settings'),
      },
      { spacer: true },
    ],
  });
}
```

### portal.js (add imports)

```javascript
import { registerBillingPages } from './billing/pages.js';
import { registerBillingMenu } from './billing/menu.js';

// In bootstrap():
registerBillingPages(app);   // Register pages first
registerBillingMenu(app);    // Then menus
```
