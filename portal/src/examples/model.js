/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MODEL — Complete reference for defining API models
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Models are the data layer. Each model maps to a django-mojo REST endpoint.
 *
 *   Model     — single record (fetch, save, destroy)
 *   Collection — paginated list of models (fetch, add, remove, query)
 *
 * Key patterns:
 *   - Helper methods callable in templates: {{model.getDisplayName}}
 *   - Static form definitions: Model.EDIT_FORM, Model.CREATE_FORM
 *   - VIEW_CLASS binding (done in the view file, not here)
 */

import { Model, Collection } from 'web-mojo';

// ── Model Class ─────────────────────────────────────────────────────────────

class MyModel extends Model {
  constructor(data = {}) {
    super(data, {
      // Must match your django-mojo REST handler URL
      endpoint: '/api/myapp/items',
    });
  }

  // Template helpers — called as {{model.getDisplayName}} in Mustache
  getDisplayName() {
    return this.get('name') || 'Untitled';
  }

  getStatusBadge() {
    const badges = {
      active: 'success',
      inactive: 'secondary',
      pending: 'warning',
      error: 'danger',
    };
    return badges[this.get('status')] || 'secondary';
  }

  // Computed properties
  isActive() {
    return this.get('status') === 'active';
  }
}


// ── Collection Class ────────────────────────────────────────────────────────

class MyModelList extends Collection {
  constructor(options = {}) {
    super({
      ModelClass: MyModel,
      endpoint: '/api/myapp/items',
      size: 25,                    // Page size
      ...options,
    });
  }
}


// ── Form Definitions ────────────────────────────────────────────────────────
// Used by TablePage (add/edit buttons) and app.modal.showForm()

MyModel.CREATE_FORM = {
  title: 'New Item',
  fields: [
    { name: 'name', label: 'Name', type: 'text', columns: 12, required: true },
    { name: 'email', label: 'Email', type: 'email', columns: 6 },
    { name: 'phone', label: 'Phone', type: 'tel', columns: 6 },
  ],
};

MyModel.EDIT_FORM = {
  title: 'Edit Item',
  fields: [
    { name: 'name', label: 'Name', type: 'text', columns: 12 },
    { name: 'email', label: 'Email', type: 'email', columns: 6 },
    { name: 'phone', label: 'Phone', type: 'tel', columns: 6 },
    {
      name: 'status', label: 'Status', type: 'select', columns: 6,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending' },
      ],
    },
    { name: 'notes', label: 'Notes', type: 'textarea', columns: 12 },

    // ── Tabbed form ─────────────────────────────────────────────────
    // For complex forms, wrap fields in tabs:
    //
    // {
    //   type: 'tabset',
    //   tabs: [
    //     { label: 'Basic', fields: [...] },
    //     { label: 'Advanced', fields: [...] },
    //   ],
    // },
  ],
};

// ── Field Type Reference ────────────────────────────────────────────────────
//
// Native:     text, email, password, number, tel, url, date, textarea,
//             select, checkbox, radio, file, hidden, color
//
// Enhanced:   toggle        — on/off switch
//             tagInput      — tag/chip input
//             datePicker    — calendar picker
//             dateRange     — start/end date picker
//             multiSelect   — multi-option dropdown
//             collectionSelect — select from a Collection
//             imageField    — image upload with preview
//
// Structural: tabset        — tabbed field groups
//             header        — section header text
//             divider       — horizontal rule
//             html          — raw HTML block
//             button        — action button
//
// Field properties:
//   name, label, type, columns (1-12), required, help,
//   placeholder, min, max, minlength, maxlength, pattern,
//   options (for select/radio), value (default)

export { MyModel, MyModelList };
