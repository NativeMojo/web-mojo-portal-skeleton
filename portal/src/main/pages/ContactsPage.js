/**
 * ContactsPage — Group-scoped TablePage
 *
 * Demonstrates:
 *   - TablePage with Collection, columns, filters, sorting
 *   - Column templates with Mustache (calling model helper methods)
 *   - Column filters (select dropdown)
 *   - Formatters (built-in: 'relative', 'datetime', 'currency', etc.)
 *   - defaultQuery for initial sort order
 *   - viewDialogOptions to control how the detail view opens
 *   - tableViewOptions for add button, pagination, etc.
 *
 * Clicking a row opens the model's VIEW_CLASS (ContactView) in a dialog.
 * The VIEW_CLASS binding happens in main/views/ContactView.js.
 */

import { TablePage } from 'web-mojo';
import { ContactList } from '../../models/Contact.js';

export default class ContactsPage extends TablePage {
  constructor(options = {}) {
    super({
      pageName: 'ContactsPage',
      title: 'Contacts',
      icon: 'bi-people',

      // The Collection class to fetch data from
      Collection: ContactList,

      // Permissions — user needs ANY of these to see the page
      permissions: ['view_contacts', 'manage_contacts', 'sys.manage_groups'],

      // Requires an active group to be selected
      requiresGroup: true,

      // Initial sort order (prefix with - for descending)
      defaultQuery: { sort: '-created' },

      // Column definitions
      columns: [
        { key: 'id', label: 'ID', sortable: true },
        {
          key: 'name',
          label: 'Name',
          sortable: true,
        },
        {
          key: 'email|default("--")',
          label: 'Email',
          sortable: true,
          filter: { type: 'text', placeholder: 'Search email...' },
        },
        {
          key: 'contact_type',
          label: 'Type',
          // Badge with dynamic class from model helper
          template: '<span class="badge bg-{{model.getTypeBadge}}">{{model.contact_type|upper|default("--")}}</span>',
          filter: {
            type: 'select',
            options: [
              { value: '', label: 'All' },
              { value: 'person', label: 'Person' },
              { value: 'company', label: 'Company' },
            ],
          },
        },
        {
          key: 'status',
          label: 'Status',
          sortable: true,
          template: '<span class="badge bg-{{model.getStatusBadge}}">{{model.status|upper|default("--")}}</span>',
          filter: {
            type: 'select',
            options: [
              { value: '', label: 'All' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'flagged', label: 'Flagged' },
            ],
          },
        },
        {
          // Pipe formatter in key — preferred over separate formatter property
          key: 'created|relative',
          label: 'Created',
          sortable: true,
          visibility: 'md',
        },
      ],

      // Detail view dialog options (opened when clicking a row)
      viewDialogOptions: { header: false, size: 'lg' },

      // Table-level options
      tableViewOptions: {
        showAdd: true,         // Show the "+ Add" button
        addForm: 'CREATE_FORM', // Which form definition to use for add
      },

      ...options,
    });
  }
}
