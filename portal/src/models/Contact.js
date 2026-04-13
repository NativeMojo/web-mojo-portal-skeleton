/**
 * Contact Model — Example group-scoped model
 *
 * Demonstrates:
 *   - Model class with endpoint + helper methods
 *   - Collection class for paginated lists
 *   - EDIT_FORM / CREATE_FORM for declarative form generation
 *   - VIEW_CLASS binding (set in main/views/ContactView.js)
 *
 * The endpoint should match your django-mojo REST handler:
 *   apps/my_app/myapp/rest/contact.py → /api/myapp/contact
 */

import { Model, Collection } from 'web-mojo';

class Contact extends Model {
  constructor(data = {}) {
    super(data, {
      endpoint: '/api/myapp/contact',
    });
  }

  // ── Helper methods ──────────────────────────────────────────────────────
  // These are callable in templates: {{model.getDisplayName}}

  getDisplayName() {
    const first = this.get('first_name') || '';
    const last = this.get('last_name') || '';
    return `${first} ${last}`.trim() || 'Unknown';
  }

  getStatusBadge() {
    const badges = {
      active: 'success',
      inactive: 'secondary',
      flagged: 'warning',
    };
    return badges[this.get('status')] || 'secondary';
  }

  getTypeBadge() {
    const badges = {
      customer: 'primary',
      vendor: 'info',
      partner: 'purple',
    };
    return badges[this.get('contact_type')] || 'secondary';
  }
}


class ContactList extends Collection {
  constructor(options = {}) {
    super({
      ModelClass: Contact,
      endpoint: '/api/myapp/contact',
      size: 25,
      ...options,
    });
  }
}


// ── Form Definitions ────────────────────────────────────────────────────────
// These are used by TablePage (add/edit dialogs) and FormView directly.
// Fields use Bootstrap's 12-column grid via the `columns` property.

Contact.CREATE_FORM = {
  title: 'New Contact',
  fields: [
    { name: 'first_name', label: 'First Name', type: 'text', columns: 6, required: true },
    { name: 'last_name', label: 'Last Name', type: 'text', columns: 6, required: true },
    { name: 'email', label: 'Email', type: 'email', columns: 6 },
    { name: 'phone', label: 'Phone', type: 'tel', columns: 6 },
    {
      name: 'contact_type', label: 'Type', type: 'select', columns: 6,
      options: [
        { value: 'customer', label: 'Customer' },
        { value: 'vendor', label: 'Vendor' },
        { value: 'partner', label: 'Partner' },
      ],
    },
  ],
};

Contact.EDIT_FORM = {
  title: 'Edit Contact',
  fields: [
    { name: 'first_name', label: 'First Name', type: 'text', columns: 6 },
    { name: 'last_name', label: 'Last Name', type: 'text', columns: 6 },
    { name: 'email', label: 'Email', type: 'email', columns: 6 },
    { name: 'phone', label: 'Phone', type: 'tel', columns: 6 },
    {
      name: 'contact_type', label: 'Type', type: 'select', columns: 6,
      options: [
        { value: 'customer', label: 'Customer' },
        { value: 'vendor', label: 'Vendor' },
        { value: 'partner', label: 'Partner' },
      ],
    },
    {
      name: 'status', label: 'Status', type: 'select', columns: 6,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'flagged', label: 'Flagged' },
      ],
    },
    { name: 'notes', label: 'Notes', type: 'textarea', columns: 12 },
  ],
};

export { Contact, ContactList };
