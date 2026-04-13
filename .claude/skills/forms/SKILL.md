---
name: forms
description: Comprehensive reference for FormPage, FormView, field types, form definitions, modal forms, validation, and auto-save in web-mojo
---

You are an expert on the web-mojo form system. Use this reference when building settings pages, modal forms, or any form-based interaction.

## FormPage — Settings Pages with Auto-Save

FormPage auto-creates a FormView bound to the active group. Fields with `metadata.*` names read/write from `group.metadata`.

```javascript
import { FormPage } from 'web-mojo';

export default class SettingsPage extends FormPage {
  constructor(options = {}) {
    super({
      pageName: 'settings',
      title: 'Settings',
      icon: 'bi-gear',
      permissions: ['manage_group', 'sys.manage_groups'],
      requiresGroup: true,

      // Auto-save each field change (no submit button needed)
      autosaveModelField: true,

      fields: [
        {
          type: 'tabset',
          tabs: [
            {
              label: 'General',
              fields: [
                { type: 'text', name: 'metadata.company_name', label: 'Company Name', columns: 6 },
                { type: 'email', name: 'metadata.admin_email', label: 'Admin Email', columns: 6 },
                { type: 'url', name: 'metadata.website', label: 'Website', columns: 6 },
                { type: 'number', name: 'metadata.max_items', label: 'Max Items', columns: 6, min: 1, max: 1000 },
              ],
            },
            {
              label: 'Features',
              fields: [
                { type: 'toggle', name: 'metadata.feature_notifications', label: 'Notifications', columns: 6 },
                { type: 'toggle', name: 'metadata.feature_api_access', label: 'API Access', columns: 6 },
              ],
            },
          ],
        },
      ],

      ...options,
    });
  }
}
```

### FormPage Lifecycle

- On `onEnter()` and `onGroupChange()`, the form is recreated for a clean slate.
- Default `getModel()` returns `app.activeGroup`. Override for custom models.
- Changes are batched — multiple field changes within 300ms are sent as one request.

### Metadata Binding

| Name Pattern | Storage |
|-------------|---------|
| `metadata.company_name` | `group.metadata.company_name` |
| `metadata.protected.branding.name` | Protected metadata (requires admin) |
| `name` | Direct model field |

---

## Modal Forms — app.modal.form()

Show a form in a dialog. Returns `{ submitted: true, data: {...} }` or `false`.

```javascript
const result = await app.modal.form({
  title: 'New Contact',
  fields: [
    { name: 'first_name', label: 'First Name', type: 'text', columns: 6, required: true },
    { name: 'last_name', label: 'Last Name', type: 'text', columns: 6, required: true },
    { name: 'email', label: 'Email', type: 'email', columns: 6 },
    { name: 'status', label: 'Status', type: 'select', columns: 6,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ]},
  ],
  size: 'lg',
  submitText: 'Create',
});

if (result?.submitted) {
  await app.rest.POST('/api/myapp/contacts', result.data);
  app.toast.success('Created');
}
```

---

## Model Static Form Definitions

Define reusable forms on your Model class:

```javascript
Contact.CREATE_FORM = {
  title: 'New Contact',
  fields: [
    { name: 'first_name', label: 'First Name', type: 'text', columns: 6, required: true },
    { name: 'last_name', label: 'Last Name', type: 'text', columns: 6, required: true },
    { name: 'email', label: 'Email', type: 'email', columns: 6 },
    { name: 'phone', label: 'Phone', type: 'tel', columns: 6 },
  ],
};

Contact.EDIT_FORM = {
  title: 'Edit Contact',
  fields: [
    { name: 'first_name', label: 'First Name', type: 'text', columns: 6 },
    { name: 'last_name', label: 'Last Name', type: 'text', columns: 6 },
    { name: 'email', label: 'Email', type: 'email', columns: 6 },
    { name: 'status', label: 'Status', type: 'select', columns: 6,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ]},
    { name: 'notes', label: 'Notes', type: 'textarea', columns: 12 },
  ],
};

Contact.FORM_DIALOG_CONFIG = { size: 'lg' };
```

Usage with TablePage: `addForm: 'CREATE_FORM'` auto-uses `Model.CREATE_FORM`.

---

## Field Types — Complete Reference

### Text Inputs

| Type | Description | Key Options |
|------|-------------|-------------|
| `text` | Single-line text | `placeholder`, `minlength`, `maxlength`, `pattern` |
| `email` | Email validation | `placeholder` |
| `password` | Show/hide toggle, strength meter | `placeholder` |
| `tel` | Phone number | `placeholder` |
| `url` | URL validation | `placeholder` |
| `number` | Numeric input | `min`, `max`, `step` |
| `search` | Search with debounce | `placeholder` |
| `textarea` | Multi-line text | `rows`, `placeholder` |
| `hidden` | Hidden field | `value` |

### Selection

| Type | Description | Key Options |
|------|-------------|-------------|
| `select` | Dropdown | `options: [{value, label}]` |
| `checkbox` | Single or multiple | `options` for multiple |
| `radio` | Radio group | `options: [{value, label}]` |
| `toggle` / `switch` | Bootstrap switch | — |
| `buttongroup` | Button-style selection | `options` |

### Advanced Inputs

| Type | Description | Key Options |
|------|-------------|-------------|
| `tag` / `tags` | Tag/chip input | `maxTags`, `separator`, `allowDuplicates` |
| `datepicker` | Calendar picker | `format`, `displayFormat`, `min`, `max` |
| `daterange` | Start/end date | `format`, `min`, `max` |
| `multiselect` | Multi-select dropdown | `options`, `searchable`, `maxSelections` |
| `combo` / `autocomplete` | Editable dropdown | `options`, `allowCustom`, `minChars` |
| `collection` | Select from API Collection | `Collection`, `labelField`, `valueField` |
| `collectionmultiselect` | Multi-select from Collection | `Collection`, `labelField`, `valueField` |

### Files & Media

| Type | Description | Key Options |
|------|-------------|-------------|
| `file` | File upload | `accept`, `multiple`, `maxSize` |
| `image` | Image with preview | `size` (sm/md/lg), `allowCrop`, `aspectRatio` |

### Date/Time

| Type | Description | Key Options |
|------|-------------|-------------|
| `date` | Native date picker | `min`, `max` |
| `datetime-local` | Date + time | `min`, `max` |
| `time` | Time picker | — |

### Other

| Type | Description | Key Options |
|------|-------------|-------------|
| `color` | Color picker | — |
| `range` | Slider | `min`, `max`, `step` |
| `json` | JSON editor | `rows` |
| `htmlpreview` | HTML editor + preview | `rows` |

### Structural (Layout Only)

| Type | Description | Key Options |
|------|-------------|-------------|
| `tabset` | Tabbed sections | `tabs: [{ label, fields }]` |
| `group` | Field group with title | `title`, `fields` |
| `header` / `heading` | Section header | `label`, `level` (1-6) |
| `divider` | Horizontal rule | — |
| `html` | Custom HTML | `content` |
| `button` | Action button | `label`, `action`, `class` |

---

## Common Field Options

Every field supports these properties:

```javascript
{
  type: 'text',                // Required
  name: 'field_name',         // Required — maps to model attribute
  label: 'Display Label',
  value: 'default',           // Default value
  placeholder: 'Enter...',
  required: true,             // Validation
  disabled: false,
  readonly: false,
  help: 'Help text below field',
  tooltip: 'Tooltip on label',
  columns: 6,                 // Grid width (1-12)
  class: 'custom-class',
  showCopy: true,             // Copy-to-clipboard button
  permissions: ['admin'],     // Show only if user has permission
  showWhen: {                 // Conditional visibility
    field: 'status',
    value: 'active',
  },
}
```

### Responsive Columns

```javascript
columns: { xs: 12, md: 6, lg: 4 }
```

---

## Tabbed Forms

```javascript
fields: [
  {
    type: 'tabset',
    tabs: [
      {
        label: 'General',
        fields: [
          { type: 'text', name: 'name', label: 'Name', columns: 6 },
          { type: 'email', name: 'email', label: 'Email', columns: 6 },
        ],
      },
      {
        label: 'Advanced',
        fields: [
          { type: 'toggle', name: 'feature_x', label: 'Enable Feature X', columns: 6 },
          { type: 'number', name: 'max_retries', label: 'Max Retries', columns: 6 },
        ],
      },
    ],
  },
]
```

---

## Conditional Visibility

Show/hide fields based on other field values:

```javascript
{ type: 'select', name: 'type', label: 'Type',
  options: ['person', 'company'] },

{ type: 'text', name: 'company_name', label: 'Company Name',
  showWhen: { field: 'type', value: 'company' } },

{ type: 'text', name: 'first_name', label: 'First Name',
  showWhen: { field: 'type', value: 'person' } },
```

---

## Select Options

Options can be specified in multiple formats:

```javascript
// Array of objects (preferred)
options: [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

// Simple array (value = label)
options: ['active', 'inactive', 'pending']
```

---

## FormView — Standalone Form Component

For embedding forms in custom views (not full pages):

```javascript
import { FormView } from 'web-mojo';

this.form = new FormView({
  containerId: 'form-container',
  model: this.model,
  fields: [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email' },
  ],
  autosaveModelField: false,  // Manual save
});
this.addChild(this.form);
```

### FormView Methods

```javascript
form.getFormData()       // Get current form values
form.setFormData(data)   // Set form values
form.validate()          // Returns boolean
form.focusFirstError()   // Focus first invalid field
form.reset()             // Clear to defaults
form.clearAllErrors()    // Remove error messages
```

### FormView Events

```javascript
form.on('submit', ({ data }) => { })       // Form submitted
form.on('change', ({ field, value }) => { }) // Any field changed
form.on('field:change', ({ field, value }) => { }) // Specific field
form.on('reset', () => { })                // Form reset
```

---

## Validation

### Client-Side (HTML5)

```javascript
{ name: 'email', type: 'email', required: true }               // Required + email
{ name: 'age', type: 'number', min: 0, max: 120 }              // Range
{ name: 'code', type: 'text', pattern: '[A-Z]{3}', minlength: 3 } // Regex
```

### Model Validation

```javascript
class Contact extends Model {
  validate(attrs) {
    const errors = {};
    if (!attrs.email) errors.email = 'Email is required';
    if (attrs.age && attrs.age < 0) errors.age = 'Age must be positive';
    return Object.keys(errors).length ? errors : null;
  }
}
```

### Server-Side

Django-mojo returns errors in `{ status: false, errors: { field: 'message' } }` format. FormView displays these inline automatically.

---

## File Handling

```javascript
// Base64 (default) — for small files
await app.modal.form({
  fields: [{ name: 'avatar', type: 'image', size: 'md' }],
  fileHandling: 'base64',     // Files encoded as data URIs in JSON
});

// Multipart — for large files
await app.modal.form({
  fields: [{ name: 'document', type: 'file', accept: '.pdf,.doc' }],
  fileHandling: true,          // FormData upload
});
```

---

## Auto-Save Behavior

When `autosaveModelField: true`:

1. User changes a field
2. Change is queued (300ms batch window)
3. Multiple changes within 300ms sent as single request
4. Each field shows "saving" indicator during save
5. Toast on success, error display on failure

---

## Common Patterns

### Settings Page

```javascript
export default class SettingsPage extends FormPage {
  constructor(options = {}) {
    super({
      pageName: 'settings',
      requiresGroup: true,
      autosaveModelField: true,
      fields: [
        { type: 'text', name: 'metadata.display_name', label: 'Display Name', columns: 6 },
        { type: 'toggle', name: 'metadata.notifications', label: 'Notifications', columns: 6 },
      ],
      ...options,
    });
  }
}
```

### Quick Add Dialog

```javascript
async onActionAdd() {
  const result = await this.getApp().modal.form(Contact.CREATE_FORM);
  if (result?.submitted) {
    await this.getApp().rest.POST('/api/myapp/contacts', result.data);
    this.getApp().toast.success('Created');
    this.refresh();
  }
}
```

### Edit Model Dialog

```javascript
async onActionEdit() {
  const result = await this.getApp().modal.modelForm({
    ...Contact.EDIT_FORM,
    model: this.model,
    size: 'lg',
  });
  if (result?.submitted) {
    this.getApp().toast.success('Saved');
    await this.render();
  }
}
```

### Custom Model for FormPage

```javascript
export default class ProfilePage extends FormPage {
  constructor(options = {}) {
    super({
      pageName: 'profile',
      autosaveModelField: true,
      fields: [
        { type: 'text', name: 'display_name', label: 'Name', columns: 6 },
        { type: 'email', name: 'email', label: 'Email', columns: 6 },
      ],
      ...options,
    });
  }

  async getModel() {
    return this.getApp().activeUser;
  }
}
```
