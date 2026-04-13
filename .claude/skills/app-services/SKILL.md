---
name: app-services
description: Comprehensive reference for app.rest, app.toast, app.modal, app.events, app.activeUser, app.getActiveGroup, navigation, and all services available via getApp() in web-mojo
---

You are an expert on the web-mojo app services. Use this reference when building any View, Page, or component that needs REST calls, notifications, modals, events, or navigation.

## Accessing App Services

Every View, Page, and child component can access the app instance:

```javascript
const app = this.getApp();
```

The app provides these core services:

| Service | Access | Purpose |
|---------|--------|---------|
| REST client | `app.rest` | HTTP requests to django-mojo backend |
| Toast notifications | `app.toast` | Success/error/info/warning pop-ups |
| Modal dialogs | `app.modal` | Alerts, confirms, forms, custom views |
| Event bus | `app.events` | Cross-component pub/sub |
| Active user | `app.activeUser` | Current authenticated user model |
| Active group | `app.getActiveGroup()` | Current group context |
| Navigation | `app.showPage()` | Programmatic page navigation |
| Loading overlay | `app.showLoading()` / `app.hideLoading()` | Full-screen loading state |

---

## app.rest — REST Client

All methods return the same response structure. Auth headers are handled automatically.

### HTTP Methods

```javascript
// GET — fetch data
const resp = await app.rest.GET('/api/myapp/contacts', {
  status: 'active',
  sort: '-created',
  size: 25,
  start: 0,
  group: group.id,
});
// resp.data = { status: true, data: [...], count: 42, start: 0, size: 25 }

// POST — create
const resp = await app.rest.POST('/api/myapp/contacts', {
  first_name: 'Jane',
  last_name: 'Doe',
  email: 'jane@example.com',
});

// PUT — full update
await app.rest.PUT(`/api/myapp/contacts/${id}`, { status: 'active' });

// PATCH — partial update
await app.rest.PATCH(`/api/myapp/contacts/${id}`, { status: 'active' });

// DELETE
await app.rest.DELETE(`/api/myapp/contacts/${id}`);
```

### Response Structure

All requests return:

```javascript
{
  success: true,              // true if 2xx status
  status: 200,               // HTTP status code
  data: { ... },             // Parsed JSON from server
  errors: null,              // Error details (if any)
  message: '',               // Human-readable message
  reason: '',                // Machine-readable error code
}
```

### Server Response Envelope

django-mojo wraps responses in a standard envelope:

```javascript
// Single object
{ status: true, data: { id: 1, name: 'Jane' } }

// List with pagination
{ status: true, data: [...], count: 42, start: 0, size: 25 }

// Error
{ status: false, code: 403, error: 'Permission denied' }
```

**Important:** The payload is at `resp.data.data` (REST response `.data` → server envelope `.data`).

### Request Options

```javascript
const resp = await app.rest.GET('/api/myapp/contacts', params, {
  timeout: 30000,            // Override timeout (ms)
  dataOnly: true,            // Unwrap server envelope — returns inner data directly
  headers: { 'X-Custom': 'value' },
  signal: abortController.signal,  // Cancel support
});
```

### File Operations

```javascript
// Upload single file
await app.rest.upload('/api/files/upload', file, {
  onProgress: (percent, loaded, total) => { },
});

// Upload with additional data
await app.rest.uploadMultipart('/api/files/upload', [file1, file2], {
  folder: 'docs',
  description: 'Project files',
});

// Download
await app.rest.download('/api/files/download', { id: fileId });
```

### Error Handling

```javascript
const resp = await app.rest.POST('/api/myapp/contacts', data);

if (!resp.success) {
  // Check specific error reasons
  if (resp.reason === 'unauthorized') {
    // Token expired
  } else if (resp.reason === 'validation_error') {
    // Show field errors: resp.data?.errors
  } else {
    app.toast.error(resp.message || 'Request failed');
  }
  return;
}
```

Error reason codes: `not_reachable`, `timed_out`, `cancelled`, `unauthorized`, `forbidden`, `not_found`, `bad_request`, `validation_error`, `rate_limited`, `server_error`.

### Common Query Parameters

| Param | Description |
|-------|-------------|
| `group` | Group ID for scoped resources |
| `sort` | Sort field (prefix `-` for desc) |
| `search` | Full-text search |
| `start` / `size` | Pagination |
| `dr_start` / `dr_end` | Date range filter |
| `graph` | Response shape (e.g., `?graph=basic`) |
| `download_format` | Export: `csv`, `json`, `xlsx` |

---

## app.toast — Toast Notifications

Small auto-dismissing pop-ups for user feedback.

```javascript
app.toast.success('Contact saved');
app.toast.error('Failed to delete contact');
app.toast.warning('This action cannot be undone');
app.toast.info('New contacts imported');
```

### With Options

```javascript
app.toast.success('Imported 42 contacts', {
  title: 'Import Complete',
  icon: 'bi-check-circle',
  delay: 5000,              // Auto-hide after 5s (default: 3000)
  autohide: true,           // Auto-dismiss (default: true)
  dismissible: true,        // Show close button
});
```

### Toast Management

```javascript
app.toast.hideAll();        // Hide all active toasts
app.toast.clearAll();       // Remove all immediately
```

---

## app.modal — Modal Dialogs

Promise-based dialogs. See the `modals` skill for full reference.

```javascript
// Alert
await app.modal.alert('Import complete.', 'Success', { type: 'success' });

// Confirm — returns boolean
const ok = await app.modal.confirm('Delete this contact?', 'Confirm', {
  confirmText: 'Delete',
  confirmClass: 'btn-danger',
});

// Prompt — returns string or null
const name = await app.modal.prompt('Enter name:', 'New Project');

// Form — returns { submitted, data } or false
const result = await app.modal.form({
  title: 'New Contact',
  fields: [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email' },
  ],
});

// Show model's VIEW_CLASS in dialog
await app.modal.showModel(contactModel);

// Show any View in dialog
await app.modal.show(new MyView({ model }), { size: 'lg' });

// Error dialog
await app.modal.showError('Something went wrong');
```

---

## app.events — Global Event Bus

Cross-component publish/subscribe. Any component can emit and listen.

```javascript
// Listen
app.events.on('contact:created', (data) => {
  console.log('New contact:', data);
});

// Emit
app.events.emit('contact:created', { id: 123, name: 'Jane' });

// One-time listener
app.events.once('user:ready', (data) => { });

// Remove listener
app.events.off('contact:created', handler);
```

### Built-in Events

| Event | Payload | When |
|-------|---------|------|
| `'app:ready'` | `{ app }` | App fully initialized |
| `'user:ready'` | `{ user }` | User data loaded after auth |
| `'group:changed'` | `{ group, previousGroup }` | User switched groups |
| `'group:cleared'` | `{ previousGroup }` | Group deselected |
| `'group:loaded'` | `{ group }` | Group data loaded |
| `'page:show'` | `{ page, pageName, params, query }` | Page displayed |
| `'page:hide'` | `{ page }` | Page hidden |
| `'page:404'` | `{ pageName }` | Page not found |
| `'page:denied'` | `{ page, pageName }` | Permission denied |
| `'portal:action'` | `{ action, ...data }` | Topbar/sidebar action |
| `'ws:ready'` | — | WebSocket connected |
| `'ws:lost'` | `{ code, reason }` | WebSocket disconnected |
| `'sidebar:toggled'` | `{ collapsed, mobile }` | Sidebar collapsed/expanded |
| `'browser:focus'` | — | Browser tab focused |
| `'browser:blur'` | — | Browser tab blurred |

---

## User & Group Context

### Active User

```javascript
const user = app.activeUser;

user.display_name           // "Jane Doe"
user.email                  // "jane@example.com"
user.id                     // 42
user.hasPermission('view_contacts')  // boolean
user.hasPermission(['manage_contacts', 'view_contacts'])  // all required
```

### Active Group

```javascript
const group = app.getActiveGroup();  // Group model or null

group.id                    // 5
group.name                  // "Acme Corp"
group.kind                  // "organization"
group.get('metadata')       // Custom metadata object
```

### Group Change Handling

Pages with `requiresGroup: true` automatically receive group changes:

```javascript
class MyPage extends Page {
  async onGroupChange(group) {
    // Re-fetch data for new group
    await this.loadData(group.id);
    await this.render();
  }
}
```

Or listen globally:

```javascript
app.events.on('group:changed', ({ group }) => {
  console.log('Switched to:', group.name);
});
```

---

## Navigation

### Programmatic Navigation

```javascript
// Navigate to a page
app.showPage('home');
app.showPage('group/contacts');

// With query parameters (appear in URL)
app.showPage('group/contacts', { status: 'active', sort: '-created' });

// With rich params (NOT in URL — passed to onParams())
app.showPage('group/detail', {}, { model: contactInstance });

// Browser history
app.router.back();
app.router.forward();
```

### Page Lifecycle on Navigation

1. `showPage('group/contacts', query, params)` called
2. Permission check → denied page if fails
3. Old page: `onExit()` → unmount
4. New page: `onParams(params, query)` → `onEnter()` → render

### URL Format

Routes use query parameter format: `?page=group/contacts&status=active&sort=-created`

### data-page Links in Templates

```html
<!-- Navigate via template -->
<a data-page="group/contacts">View Contacts</a>
<a data-page="group/detail" data-params='{"id": 123}'>Contact #123</a>
```

---

## Loading Overlay

Counter-based — each `showLoading()` needs a matching `hideLoading()`.

```javascript
app.showLoading('Importing contacts...');
try {
  await app.rest.POST('/api/myapp/contacts/import', { file_id: 123 });
  app.toast.success('Import complete');
} finally {
  app.hideLoading();
}
```

---

## App State

Simple key-value state management:

```javascript
app.setState({ theme: 'dark', locale: 'en' });
const theme = app.getState('theme');

app.events.on('state:changed', ({ oldState, newState, updates }) => {
  if (updates.theme) applyTheme(updates.theme);
});
```

---

## WebSocket (if enabled)

```javascript
// Check if available
if (app.ws) {
  // Subscribe to a channel
  app.ws.subscribe('notifications', (data) => {
    app.toast.info(data.message);
  });

  // Send message
  app.ws.send({ type: 'ping' });
}

// Listen for connection events
app.events.on('ws:ready', () => { });
app.events.on('ws:lost', ({ code, reason }) => { });
```

---

## Common Patterns

### CRUD Operations

```javascript
async onActionCreate() {
  const app = this.getApp();
  const result = await app.modal.form(Contact.CREATE_FORM);
  if (result?.submitted) {
    const resp = await app.rest.POST('/api/myapp/contacts', result.data);
    if (resp.success) {
      app.toast.success('Created');
      this.refresh();
    } else {
      app.toast.error(resp.message || 'Failed to create');
    }
  }
}

async onActionDelete() {
  const app = this.getApp();
  const ok = await app.modal.confirm('Delete this contact?', 'Confirm', {
    confirmText: 'Delete',
    confirmClass: 'btn-danger',
  });
  if (ok) {
    await this.model.destroy();
    app.toast.success('Deleted');
    app.showPage('group/contacts');
  }
}
```

### Loading State for Long Operations

```javascript
async onActionExport() {
  const app = this.getApp();
  app.showLoading('Exporting data...');
  try {
    const resp = await app.rest.GET('/api/myapp/contacts', {
      download_format: 'csv',
      group: app.getActiveGroup().id,
    });
    app.toast.success('Export ready');
  } finally {
    app.hideLoading();
  }
}
```

### Cross-Component Communication

```javascript
// In ContactsPage — emit after creating a contact
app.events.emit('contact:created', { id: resp.data.data.id });

// In DashboardPage — listen and refresh stats
app.events.on('contact:created', () => {
  this.statsView?.refresh();
});
```

### Auth-Aware Error Handling

```javascript
const resp = await app.rest.GET('/api/myapp/secure-data');
if (!resp.success) {
  if (resp.reason === 'unauthorized') {
    // Token expired — app handles redirect automatically
    return;
  }
  if (resp.reason === 'forbidden') {
    app.toast.error('You do not have permission');
    return;
  }
  app.toast.error(resp.message || 'Request failed');
}
```
