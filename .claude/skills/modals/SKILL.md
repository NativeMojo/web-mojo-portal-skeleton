---
name: modals
description: Comprehensive reference for Modal dialogs — alert, confirm, prompt, showForm, showModel, showView, loading overlay, and Dialog options in web-mojo
---

You are an expert on the web-mojo Modal and Dialog system. Use this reference when building or modifying any dialog-based interaction.

## Quick Access

All modal methods are available via `this.getApp().modal` (alias for the static `Modal` class) or imported directly.

```javascript
const app = this.getApp();

await app.modal.alert('Done!');
await app.modal.confirm('Sure?');
await app.modal.form({ fields: [...] });
await app.modal.show(viewInstance);
await app.modal.showModel(modelInstance);
```

---

## Modal.alert(message, title?, options?)

Show an informational alert. Returns `Promise<void>`.

```javascript
await app.modal.alert('Import complete.', 'Success', { type: 'success' });
```

| Option | Default | Description |
|--------|---------|-------------|
| `message` | `''` | Alert body text |
| `title` | `'Alert'` | Header title |
| `type` | `'info'` | Style: `'info'`, `'success'`, `'warning'`, `'danger'`/`'error'` |
| `size` | `'sm'` | Modal size |
| `buttonText` | `'OK'` | Button label |
| `buttonClass` | `'btn-primary'` | Button class |

Type-based icons: info → info-circle, success → check-circle, warning → exclamation-triangle, danger → x-circle.

---

## Modal.confirm(message, title?, options?)

Confirmation dialog. Returns `Promise<boolean>` — `true` if confirmed.

```javascript
const confirmed = await app.modal.confirm('Delete this contact?', 'Confirm Delete', {
  confirmText: 'Delete',
  confirmClass: 'btn-danger',
});

if (confirmed) {
  await model.destroy();
  app.toast.success('Deleted');
}
```

| Option | Default | Description |
|--------|---------|-------------|
| `message` | — | Confirmation text |
| `title` | `'Confirm'` | Header title |
| `size` | `'sm'` | Modal size |
| `backdrop` | `'static'` | Prevent closing by clicking outside |
| `confirmText` | `'Confirm'` | Confirm button label |
| `confirmClass` | `'btn-primary'` | Confirm button class |
| `cancelText` | `'Cancel'` | Cancel button label |

---

## Modal.prompt(message, title?, options?)

Text input dialog. Returns `Promise<string|null>` — entered value or `null`.

```javascript
const name = await app.modal.prompt('Enter project name:', 'New Project', {
  defaultValue: 'Untitled',
  placeholder: 'Project name',
});

if (name) {
  await app.rest.POST('/api/myapp/projects', { name });
}
```

| Option | Default | Description |
|--------|---------|-------------|
| `message` | — | Prompt text |
| `title` | `'Input'` | Header title |
| `defaultValue` | `''` | Pre-filled value |
| `inputType` | `'text'` | HTML input type |
| `placeholder` | `''` | Placeholder |
| `size` | `'sm'` | Modal size |

---

## Modal.form(options) / app.modal.showForm(options)

Form dialog. Returns `Promise<{ submitted: boolean, data: object } | false>`.

```javascript
const result = await app.modal.form({
  title: 'New Contact',
  fields: [
    { name: 'first_name', label: 'First Name', type: 'text', columns: 6, required: true },
    { name: 'last_name', label: 'Last Name', type: 'text', columns: 6, required: true },
    { name: 'email', label: 'Email', type: 'email', columns: 6 },
    { name: 'phone', label: 'Phone', type: 'tel', columns: 6 },
    { name: 'status', label: 'Status', type: 'select', columns: 6,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ]},
    { name: 'notes', label: 'Notes', type: 'textarea', columns: 12 },
  ],
  size: 'lg',
});

if (result?.submitted) {
  await app.rest.POST('/api/myapp/contacts', result.data);
  app.toast.success('Contact created');
}
```

| Option | Default | Description |
|--------|---------|-------------|
| `title` | `'Form'` | Dialog title |
| `fields` | `[]` | Field config array (see Forms skill) |
| `data` | — | Pre-populate from plain object |
| `defaults` | — | Default values for missing fields |
| `model` | — | Pre-populate from Model instance |
| `submitText` | `'Submit'` | Submit button label |
| `cancelText` | `'Cancel'` | Cancel button label |
| `size` | `'md'` | Modal size |
| `centered` | `true` | Vertically center |
| `fileHandling` | `'base64'` | `'base64'` or `true` for multipart |

### Using Model Static Forms

```javascript
// Define on Model
Contact.CREATE_FORM = {
  title: 'New Contact',
  fields: [
    { name: 'first_name', label: 'First Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email' },
  ],
};

// Use in dialog
const result = await app.modal.form(Contact.CREATE_FORM);
```

---

## Modal.modelForm(options)

Form dialog that auto-saves to a Model. Returns `Promise<{ submitted: boolean, model: Model } | false>`.

```javascript
const result = await app.modal.modelForm({
  title: 'Edit Contact',
  model: this.model,
  fields: Contact.EDIT_FORM.fields,
  size: 'lg',
});

if (result?.submitted) {
  app.toast.success('Saved');
  await this.render();
}
```

Same options as `form()` plus:
- `model` — **Required**. Model instance to edit. Auto-populated, auto-saved on submit.
- `onSuccess(model)` — Called after successful save.
- `onError(error, model)` — Called on save failure.

---

## Modal.show(view, options?)

Show any View instance in a modal. Returns `Promise<*>` — button value or `null`.

```javascript
import ContactView from './views/ContactView.js';

const view = new ContactView({ model: contactModel });
await app.modal.show(view, {
  size: 'lg',
  title: false,           // Hide header (view has its own)
  buttons: [
    { text: 'Edit', action: 'edit', class: 'btn-primary' },
    { text: 'Close', class: 'btn-secondary', dismiss: true },
  ],
});
```

| Option | Default | Description |
|--------|---------|-------------|
| `size` | `'lg'` | `'sm'`, `'md'`, `'lg'`, `'xl'`, `'fullscreen'` |
| `title` | `false` | Dialog title (false = no header) |
| `buttons` | Close button | Button configuration array |
| `header` | `true` | Show/hide header |
| `centered` | `true` | Vertically center |
| `scrollable` | `false` | Scrollable body |
| `backdrop` | `true` | `true`, `false`, or `'static'` |
| `keyboard` | `true` | Close on Escape |

---

## Modal.showModel(model, options?)

Look up `Model.VIEW_CLASS` and show it in a modal. Returns `Promise<*>`.

```javascript
// Requires: Contact.VIEW_CLASS = ContactView (set in ContactView.js)
await app.modal.showModel(contactModel);
await app.modal.showModel(contactModel, { size: 'xl' });
```

This is what TablePage uses internally when a row is clicked.

---

## Modal.showModelById(ModelClass, id, options?)

Fetch a model by ID, then show its VIEW_CLASS. Returns `Promise<*>`.

```javascript
await Modal.showModelById(Contact, 42);
await Modal.showModelById(Contact, contactId, { size: 'xl' });
```

---

## Modal.data(options)

Show structured read-only data. Returns `Promise<void>`.

```javascript
await app.modal.data({
  title: 'Contact Details',
  model: contactModel,     // OR data: plainObject
  fields: [
    { name: 'first_name', label: 'First Name' },
    { name: 'email', label: 'Email' },
    { name: 'created', label: 'Created', format: 'datetime_tz' },
  ],
  columns: 2,              // 2-column layout
  size: 'lg',
  showEmptyValues: true,
});
```

---

## Loading Overlay

Counter-based — each `loading()` needs a matching `hideLoading()`.

```javascript
app.modal.loading('Importing contacts...');
try {
  await app.rest.POST('/api/myapp/contacts/import', { file_id: 123 });
} finally {
  app.modal.hideLoading();
}

// Force-hide (resets counter)
app.modal.hideLoading(true);
```

Also available as `app.showLoading(msg)` / `app.hideLoading()`.

---

## Dialog.showDialog(options) — Custom Dialogs

For full control, use Dialog directly:

```javascript
import { Dialog } from 'web-mojo';

const result = await Dialog.showDialog({
  title: 'Choose Export Format',
  body: '<p>Select a format for your data export.</p>',
  size: 'sm',
  centered: true,
  buttons: [
    { text: 'CSV', value: 'csv', class: 'btn-outline-primary', icon: 'bi bi-file-earmark-spreadsheet' },
    { text: 'JSON', value: 'json', class: 'btn-outline-primary', icon: 'bi bi-file-earmark-code' },
    { text: 'Cancel', class: 'btn-secondary', dismiss: true },
  ],
});

if (result) {
  await exportData(result);  // result = 'csv' or 'json'
}
```

### Button Configuration

```javascript
{
  text: 'Save',              // Button label
  class: 'btn-primary',     // Bootstrap button class
  icon: 'bi bi-check',      // Optional icon
  value: 'saved',           // Value the promise resolves with
  action: 'save',           // Named action (emits 'action:save' event)
  dismiss: false,           // Close without resolving a value
  disabled: false,          // Disabled state
}
```

---

## Dialog.showCode(code, language?, options?)

Show syntax-highlighted code. Uses Prism.js with copy button.

```javascript
await Dialog.showCode(
  JSON.stringify(apiResponse, null, 2),
  'json',
  { title: 'API Response', size: 'lg' }
);
```

---

## Dialog.showHtmlPreview(html, title?, options?)

Preview HTML in a sandboxed iframe.

```javascript
await Dialog.showHtmlPreview(emailTemplate, 'Email Preview', {
  size: 'xl',
  height: '600px',
});
```

---

## Context Menus in Dialogs

```javascript
await Dialog.showDialog({
  title: 'Contact Details',
  body: contactView,
  contextMenu: [
    { icon: 'bi-pencil', label: 'Edit', action: 'edit' },
    { icon: 'bi-trash', label: 'Delete', action: 'delete' },
    { type: 'divider' },
    { icon: 'bi-download', label: 'Export', action: 'export' },
  ],
});
```

---

## Dialog Instance Events

```javascript
const dialog = new Dialog({ ... });

dialog.on('show', () => { });       // About to show
dialog.on('shown', () => { });      // Visible and focused
dialog.on('hide', () => { });       // About to hide
dialog.on('hidden', () => { });     // Hidden and cleaned up
dialog.on('action:edit', () => { });  // Button action fired
```

---

## Common Patterns

### Confirm Before Delete

```javascript
async onActionDelete(event, element) {
  const app = this.getApp();
  const confirmed = await app.modal.confirm(
    `Delete "${this.model.get('name')}"? This cannot be undone.`,
    'Confirm Delete',
    { confirmText: 'Delete', confirmClass: 'btn-danger' }
  );
  if (confirmed) {
    await this.model.destroy();
    app.toast.success('Deleted');
  }
}
```

### Edit via Form Dialog

```javascript
async onActionEdit(event, element) {
  const app = this.getApp();
  const result = await app.modal.form({
    ...Contact.EDIT_FORM,
    model: this.model,
  });
  if (result?.submitted) {
    await this.model.save(result.data);
    app.toast.success('Saved');
    await this.render();
  }
}
```

### Chained Dialogs

```javascript
const format = await Dialog.showDialog({
  title: 'Export',
  buttons: [
    { text: 'CSV', value: 'csv' },
    { text: 'JSON', value: 'json' },
    { text: 'Cancel', dismiss: true },
  ],
});
if (format) {
  app.modal.loading('Exporting...');
  try {
    await exportData(format);
    app.toast.success(`Exported as ${format.toUpperCase()}`);
  } finally {
    app.modal.hideLoading();
  }
}
```
