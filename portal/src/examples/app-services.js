/**
 * ═══════════════════════════════════════════════════════════════════════════
 * APP SERVICES — Quick reference for the services available on every View
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Every View (Page, FormPage, TablePage, etc.) can access the app instance:
 *
 *   const app = this.getApp();
 *
 * The app instance provides these core services:
 */


// ── REST Client ─────────────────────────────────────────────────────────────
// Make HTTP requests to your django-mojo backend.
// All methods return { data, status } and handle auth headers automatically.

async function restExamples() {
  const app = this.getApp();

  // GET request
  const response = await app.rest.GET('/api/myapp/contact', { status: 'active', size: 10 });
  console.log(response.data);   // { status: true, data: [...], count: 42 }

  // POST request
  const created = await app.rest.POST('/api/myapp/contact', {
    first_name: 'Jane',
    last_name: 'Doe',
    email: 'jane@example.com',
  });

  // PUT request
  await app.rest.PUT(`/api/myapp/contact/${id}`, { status: 'active' });

  // DELETE request
  await app.rest.DELETE(`/api/myapp/contact/${id}`);
}


// ── Toast Notifications ─────────────────────────────────────────────────────
// Small pop-up messages for user feedback. Auto-dismiss after a few seconds.

function toastExamples() {
  const app = this.getApp();

  app.toast.success('Contact saved');
  app.toast.error('Failed to delete contact');
  app.toast.warning('This action cannot be undone');
  app.toast.info('New contacts imported');
}


// ── Modal Dialogs ───────────────────────────────────────────────────────────
// Promise-based dialogs: alerts, confirms, forms, and custom views.

async function modalExamples() {
  const app = this.getApp();

  // Simple alert
  await app.modal.alert({
    title: 'Notice',
    message: 'The import is complete.',
  });

  // Confirm dialog — returns true/false
  const confirmed = await app.modal.confirm({
    title: 'Delete Contact',
    message: 'Are you sure?',
    confirmLabel: 'Delete',
    confirmClass: 'btn-danger',
  });

  if (confirmed) {
    // user clicked "Delete"
  }

  // Form dialog — returns form data or null (cancelled)
  const formData = await app.modal.showForm({
    title: 'Quick Add',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email' },
    ],
  });

  if (formData) {
    await app.rest.POST('/api/myapp/contact', formData);
    app.toast.success('Contact created');
  }

  // Show any View in a modal dialog
  // import { Modal } from 'web-mojo';
  // Modal.showModel(someModelInstance);  // Uses model's VIEW_CLASS
}


// ── Event Bus ───────────────────────────────────────────────────────────────
// Publish-subscribe for cross-component communication.

function eventBusExamples() {
  const app = this.getApp();

  // Listen for events
  app.events.on('contact:created', (data) => {
    console.log('New contact:', data);
  });

  // Emit events
  app.events.emit('contact:created', { id: 123, name: 'Jane' });

  // Built-in events you can listen to:
  //   'group:changed'   — user switched groups
  //   'user:ready'      — user data loaded
  //   'ws:ready'        — WebSocket connected
  //   'app:ready'       — app fully initialized
  //   'portal:action'   — topbar action button clicked
}


// ── Navigation ──────────────────────────────────────────────────────────────
// Navigate between pages programmatically.

function navigationExamples() {
  const app = this.getApp();

  // Navigate to a page
  app.showPage('group/contacts');

  // Navigate with query parameters
  app.showPage('group/contacts', { status: 'flagged' });

  // Get the current page
  const currentPage = app.getCurrentPage();
}


// ── Group & User Context ────────────────────────────────────────────────────
// Access the currently active group and authenticated user.

function contextExamples() {
  const app = this.getApp();

  // Current user
  const user = app.activeUser;
  console.log(user.display_name, user.email);

  // Current group (null if none selected)
  const group = app.getActiveGroup();
  console.log(group.id, group.name, group.kind);

  // Group metadata (custom settings stored on the group)
  const meta = group.get('metadata');
  console.log(meta.display_name);
}


// ── Loading Indicator ───────────────────────────────────────────────────────
// Full-screen loading overlay for long operations.

async function loadingExamples() {
  const app = this.getApp();

  app.showLoading('Importing contacts...');
  try {
    await app.rest.POST('/api/myapp/contact/import', { file_id: 123 });
  } finally {
    app.hideLoading();
  }
}
