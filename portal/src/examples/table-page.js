/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TABLE PAGE — Complete reference for data table pages
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * TablePage wraps a TableView and syncs table state (pagination, sort,
 * search, filters) with the browser URL automatically.
 *
 * Copy this file, rename the class, and adjust to your model.
 */

import { TablePage } from 'web-mojo';
// import { MyModelList } from '../../models/MyModel.js';

export default class MyTablePage extends TablePage {
  constructor(options = {}) {
    super({
      pageName: 'MyTablePage',
      title: 'My Items',
      icon: 'bi-table',

      // ── Data Source ──────────────────────────────────────────────────
      // Collection: MyModelList,

      // ── Access Control ───────────────────────────────────────────────
      permissions: ['view_items', 'manage_items'],
      requiresGroup: true,

      // ── Default Query ────────────────────────────────────────────────
      // Applied on first load. Prefix with - for descending.
      defaultQuery: { sort: '-created' },

      // ── Columns ──────────────────────────────────────────────────────
      columns: [
        // Simple sortable column — key renders the field automatically
        { key: 'id', label: 'ID', sortable: true },

        // Name — let the key do the work. Use a model helper for display logic.
        // If getDisplayName() is defined on the model, you can use it in templates.
        { key: 'name', label: 'Name', sortable: true },

        // Date with pipe formatter — preferred over separate `formatter:` property
        {
          key: 'created|relative',       // "2 hours ago"
          // key: 'created|datetime',     // "Apr 12, 2026 3:45 PM"
          // key: 'created|date',         // "Apr 12, 2026"
          label: 'Created',
          sortable: true,
          visibility: 'md',              // Hide on small screens
        },

        // Column with email link formatter
        {
          key: 'email|email',
          label: 'Email',
          sortable: true,
          filter: { type: 'text', placeholder: 'Search email...' },
        },

        // Status badge — template is appropriate here for custom HTML
        {
          key: 'status',
          label: 'Status',
          template: '<span class="badge bg-{{model.getStatusBadge}}">{{model.status|upper}}</span>',

          // Column filter — dropdown in the filter bar
          filter: {
            type: 'select',
            options: [
              { value: '', label: 'All' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ],
          },
        },

        // Currency column (expects value in cents)
        // { key: 'amount|currency', label: 'Amount', sortable: true, footer_total: true },

        // Date range filter column
        // { key: 'created|datetime', label: 'Created', filter: { type: 'daterange' } },
      ],

      // ── Detail View Dialog ───────────────────────────────────────────
      // When a row is clicked, the model's VIEW_CLASS is shown in a dialog.
      viewDialogOptions: {
        header: false,    // Hide the dialog's default header (the view has its own)
        size: 'lg',       // 'sm', 'md', 'lg', 'xl'
      },

      // ── Table Options ────────────────────────────────────────────────
      tableViewOptions: {
        showAdd: true,                   // Show "+ Add" button
        addForm: 'CREATE_FORM',          // Use Model.CREATE_FORM for add dialog
        showSearch: true,                // Show search input
        showPagination: true,            // Show pagination controls
        // hideActivePillNames: ['group'],  // Hide these filter pills
        // fetchOnMount: true,            // Fetch data when table mounts (default: true)
        // fontSize: 'sm',               // 'sm' for compact rows
      },

      ...options,
    });
  }

  // ── Optional Overrides ──────────────────────────────────────────────────

  // Custom add handler (instead of default form dialog)
  // async onAdd() {
  //   const app = this.getApp();
  //   const data = await app.modal.showForm(MyModel.CREATE_FORM);
  //   if (data) {
  //     await app.rest.POST('/api/myapp/items', data);
  //     app.toast.success('Item created');
  //     this.refresh();
  //   }
  // }
}
