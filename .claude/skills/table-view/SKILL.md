---
name: table-view
description: Comprehensive reference for building TablePage and TableView components in web-mojo portals
---

You are an expert on the web-mojo TableView and TablePage components. Use this reference when creating, modifying, or debugging table-based pages.

## TablePage — The Page Wrapper

TablePage wraps TableView and auto-syncs table state (pagination, sort, search, filters) with the browser URL.

### Constructor Options

```javascript
import { TablePage } from 'web-mojo';
import { ContactList } from '../../models/Contact.js';

export default class ContactsPage extends TablePage {
  constructor(options = {}) {
    super({
      // ── Page Config ─────────────────────────────────────
      pageName: 'contacts',
      title: 'Contacts',
      icon: 'bi-people',
      permissions: ['view_contacts'],
      requiresGroup: true,

      // ── Data Source ─────────────────────────────────────
      Collection: ContactList,          // Collection CLASS (not instance)
      // collection: existingCollection, // OR pre-made instance

      // ── Default Query ───────────────────────────────────
      defaultQuery: { sort: '-created' },

      // ── Columns ─────────────────────────────────────────
      columns: [ /* see Column Config below */ ],

      // ── Detail View ─────────────────────────────────────
      // Model.VIEW_CLASS is auto-detected. Configure the dialog:
      viewDialogOptions: {
        header: false,              // Hide dialog header (view has its own)
        size: 'lg',                 // 'sm', 'md', 'lg', 'xl'
      },

      // ── Table Options ───────────────────────────────────
      tableViewOptions: {
        showAdd: true,
        addForm: 'CREATE_FORM',     // Uses Model.CREATE_FORM
        searchable: true,
        paginated: true,
        sortable: true,
        filterable: true,
        showExport: true,
        showRefresh: true,
        emptyMessage: 'No contacts found',
        // hideActivePillNames: ['group'],
      },

      ...options,
    });
  }
}
```

### TablePage Methods

```javascript
this.refresh()                    // Refresh table data
this.getSelectedItems()           // Get selected models
this.clearSelection()             // Deselect all
this.clearAllFilters()            // Remove all filters
```

### TablePage Lifecycle

```javascript
onEnter()                         // Called when page becomes visible (cached pages)
onGroupChange(group)              // Called when active group changes
```

---

## Column Configuration

### CRITICAL RULES

1. **No `width` property** — columns do NOT support `width`. Use `class` for sizing.
2. **Prefer `key` with pipes** over separate `formatter` — `{ key: 'created|datetime' }` is cleaner.
3. **Do NOT add `template`** unless you need custom HTML beyond what formatters provide.
4. **Include `filter` config** where filtering is useful.

### Column Properties

```javascript
columns: [
  {
    key: 'fieldName',               // REQUIRED: field name, supports pipes: 'created|datetime'
    label: 'Column Title',          // Display label (auto-capitalized if omitted)
    sortable: true,                 // Enable sorting on this column
    class: 'text-end',             // CSS classes (use instead of width!)

    // ── Responsive Visibility ───────────────────────────
    visibility: 'md',               // Show at md+ breakpoint, hide on xs/sm
    // visibility: { show: 'md', hide: 'xl' },  // Show only between md and xl

    // ── Formatting ──────────────────────────────────────
    // Option 1: Pipe in key (PREFERRED)
    // key: 'created|datetime',

    // Option 2: Separate formatter property
    // formatter: 'datetime',
    // formatter: (value, context) => `<span>${value}</span>`,

    // Option 3: Mustache template (ONLY when you need custom HTML)
    // template: '<span class="badge bg-{{model.getStatusBadge}}">{{model.status|upper}}</span>',

    // ── Filtering ───────────────────────────────────────
    filter: {
      type: 'select',              // select, text, multiselect, daterange, number, boolean
      label: 'Filter by Status',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ],
    },

    // ── Inline Editing ──────────────────────────────────
    editable: true,
    editableOptions: {
      type: 'text',                // text, select, checkbox, switch, textarea
      placeholder: 'Enter value',
    },
    autoSave: true,                // Auto-save on change

    // ── Footer ──────────────────────────────────────────
    footer_total: true,            // Sum numeric values in footer row
  }
]
```

### Common Column Patterns

```javascript
// ── Simple sortable column ──────────────────────────────
{ key: 'name', label: 'Name', sortable: true },

// ── Date with formatter pipe ────────────────────────────
{ key: 'created|datetime', label: 'Created', sortable: true },
{ key: 'created|relative', label: 'Created', sortable: true },

// ── Currency (expects cents) ────────────────────────────
{ key: 'amount|currency', label: 'Amount', sortable: true },

// ── Status badge (needs custom HTML → template is OK) ───
{
  key: 'status',
  label: 'Status',
  template: '<span class="badge bg-{{model.getStatusBadge}}">{{model.status|upper}}</span>',
  filter: {
    type: 'select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ],
  },
},

// ── Boolean with icon ───────────────────────────────────
{ key: 'is_verified|yesnoicon', label: 'Verified' },

// ── Email with link ─────────────────────────────────────
{ key: 'email|email', label: 'Email' },

// ── Hidden on small screens ─────────────────────────────
{ key: 'phone', label: 'Phone', visibility: 'md' },

// ── Truncated text ──────────────────────────────────────
{ key: 'notes|truncate:60', label: 'Notes', visibility: 'lg' },

// ── With default fallback ───────────────────────────────
{ key: 'company|default:("N/A")', label: 'Company' },
```

---

## Pipe Formatters Reference

Use in column `key` or templates: `{{model.field|formatter}}`.

### Date/Time
| Formatter | Output | Example |
|-----------|--------|---------|
| `date` | MM/DD/YYYY | 04/12/2026 |
| `datetime` | Full date+time | Apr 12, 2026 3:45 PM |
| `datetime_tz` | With timezone | Apr 12, 2026 3:45 PM EST |
| `time` | HH:mm:ss | 15:45:00 |
| `relative` | Human relative | 2 hours ago |
| `relative_short` | Short relative | 2h ago |
| `epoch` | Unix timestamp (chain with others) | `epoch\|datetime` |
| `date:'YYYY-MM-DD'` | Custom format (quote args!) | 2026-04-12 |

### Numbers
| Formatter | Output |
|-----------|--------|
| `number` | Localized: 1,234 |
| `currency` | USD: $12.50 (input in cents) |
| `percent` | 85% |
| `filesize` | 1.2 MB |
| `ordinal` | 1st, 2nd, 3rd |
| `compact` | 1.2K, 5M |

### Text
| Formatter | Output |
|-----------|--------|
| `upper` / `uppercase` | UPPERCASE |
| `lower` / `lowercase` | lowercase |
| `capitalize` | Capitalize First |
| `truncate:60` | Long text... |
| `truncate_middle:20` | Long...text |
| `initials` | JD (from John Doe) |
| `slug` | my-slug-text |
| `default:'fallback'` | Fallback if empty |

### HTML/Display
| Formatter | Output |
|-----------|--------|
| `email` | Clickable email link |
| `phone` | Formatted phone |
| `url` | Clickable URL |
| `badge` | Bootstrap badge |
| `status` | Status with color |
| `boolean` | True/False |
| `yesno` | Yes/No |
| `yesnoicon` | ✓/✗ icons |
| `avatar:md` | Circular image (xs/sm/md/lg/xl) |
| `clipboard` | Copy button |
| `linkify` | Auto-link URLs/emails |
| `highlight:term` | Highlight search term |

### Conditional
| Formatter | Output |
|-----------|--------|
| `equals:value:'yes':'no'` | Conditional text |
| `plural:item:items` | 1 item / 2 items |

### Chaining
```
created|epoch|datetime         → epoch timestamp → formatted datetime
name|truncate:30|upper         → truncate then uppercase
amount|currency|default:'N/A'  → format as currency, fallback if empty
```

---

## Filtering

### Column-Level Filters

```javascript
{
  key: 'status',
  label: 'Status',
  filter: {
    type: 'select',                    // REQUIRED
    label: 'Filter by Status',         // Optional display label
    options: [                         // For select/multiselect
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ],
    placeholder: 'Choose...',          // For text/number
  },
}
```

### Filter Types

| Type | Description | Extra Options |
|------|-------------|---------------|
| `text` | Text input | `placeholder` |
| `select` | Single dropdown | `options: [{value, label}]` |
| `multiselect` | Multi-select | `options: [{value, label}]` |
| `number` | Number input | `placeholder` |
| `daterange` | Date range picker | `startName`, `endName`, `fieldName`, `format`, `displayFormat` |
| `boolean` | Toggle/checkbox | — |

### Table-Level Filters (Not in Columns)

Additional filters that don't correspond to a visible column:

```javascript
tableViewOptions: {
  filters: [
    {
      name: 'status',                 // Query param name
      label: 'Status',
      type: 'select',
      options: ['active', 'inactive'],
    },
    {
      name: 'created',
      label: 'Created',
      type: 'daterange',
      startName: 'dr_start',
      endName: 'dr_end',
    },
  ],
}
```

### Django Lookup Filters

Filter keys support Django-style lookups:

```javascript
{ name: 'status', type: 'select' }             // Exact match
{ name: 'status__in', type: 'multiselect' }    // IN lookup
{ name: 'created__gte', type: 'daterange' }     // Greater than or equal
{ name: 'created__lte', type: 'daterange' }     // Less than or equal
{ name: 'name__icontains', type: 'text' }       // Case-insensitive contains
```

### Filter Pills

Active filters display as removable badges below the toolbar. Control with:
- `hideActivePills: false` — hide all pills
- `hideActivePillNames: ['group']` — hide specific pills

---

## Actions & Context Menus

### Row Actions

```javascript
actions: ['view', 'edit', 'delete'],   // Built-in actions
```

### Custom Context Menu

```javascript
contextMenu: [
  { label: 'View Details', action: 'view', icon: 'bi bi-eye' },
  { label: 'Edit', action: 'edit', icon: 'bi bi-pencil' },
  { separator: true },
  { label: 'Delete', action: 'delete', icon: 'bi bi-trash', danger: true },
]
```

### Batch Actions

```javascript
selectionMode: 'multiple',
batchActions: [
  { label: 'Delete Selected', action: 'delete-batch', icon: 'bi bi-trash' },
  { label: 'Archive', action: 'archive', icon: 'bi bi-archive' },
],
batchBarLocation: 'top',    // or 'bottom' (default)
```

Handle batch events:
```javascript
this.tableView.on('batch:action', async ({ action, items }) => {
  if (action === 'delete-batch') {
    for (const model of items) await model.destroy();
    this.refresh();
  }
});
```

---

## Toolbar Customization

```javascript
tableViewOptions: {
  showAdd: true,
  addButtonLabel: 'New Contact',
  addButtonIcon: 'bi bi-plus-circle',
  showExport: true,
  exportSource: 'remote',             // 'remote' or 'local'
  showRefresh: true,
  searchable: true,
  searchPlacement: 'toolbar',         // 'toolbar' or 'dropdown'
  searchPlaceholder: 'Search contacts...',

  // Custom toolbar buttons
  toolbarButtons: [
    {
      label: 'Import',
      icon: 'bi bi-upload',
      variant: 'outline-secondary',
      action: 'import',
      // handler: (event, element) => { ... },
      // permissions: ['manage_contacts'],
    },
  ],
}
```

---

## Inline Cell Editing

```javascript
{
  key: 'quantity',
  label: 'Qty',
  editable: true,
  editableOptions: {
    type: 'number',           // text, select, checkbox, switch, textarea
    inputType: 'number',
  },
  autoSave: true,             // Auto-save on change
},
{
  key: 'status',
  label: 'Status',
  editable: true,
  editableOptions: {
    type: 'select',
    options: ['active', 'inactive', 'pending'],
  },
  autoSave: true,
}
```

---

## Table Display Options

```javascript
tableViewOptions: {
  tableOptions: {
    striped: true,
    bordered: false,
    hover: true,
    responsive: false,
    size: null,               // 'sm', 'lg'
    fontSize: null,           // 'sm', 'xs'
  },
  emptyMessage: 'No items found',
}
```

---

## Footer Totals

```javascript
columns: [
  { key: 'description', label: 'Item' },
  { key: 'amount|currency', label: 'Amount', footer_total: true },
  { key: 'qty', label: 'Quantity', footer_total: true },
]
// Renders a tfoot row with "Totals" label and summed values
```

---

## Events

Listen on `this.tableView` within a TablePage:

```javascript
// Table events
this.tableView.on('params-changed', () => {})
this.tableView.on('table:search', ({ searchTerm }) => {})
this.tableView.on('table:sort', ({ field }) => {})
this.tableView.on('table:add', ({ event }) => {})
this.tableView.on('table:export', ({ format, source }) => {})

// Row events
this.tableView.on('row:click', ({ model, column, event }) => {})
this.tableView.on('row:view', ({ model, event }) => {})
this.tableView.on('row:edit', ({ model, event }) => {})
this.tableView.on('row:delete', ({ model, event }) => {})

// Cell editing events
this.tableView.on('cell:save', ({ model, column, oldValue, newValue }) => {})

// Filter events
this.tableView.on('filter:edit', ({ key }) => {})
this.tableView.on('filter:remove', ({ key, field }) => {})
this.tableView.on('filters:clear', () => {})

// Batch events
this.tableView.on('batch:action', ({ action, items, event }) => {})
```

---

## URL Synchronization

TablePage auto-syncs these URL parameters:

| Param | Purpose |
|-------|---------|
| `start` | Pagination offset |
| `size` | Page size |
| `sort` | Sort field (prefix `-` for desc) |
| `search` | Search term |
| `_item` | Deep-link to specific item (auto-opens dialog) |
| *other* | Treated as filters |

Example URL: `?start=0&size=25&sort=-created&search=jane&status=active&_item=123`

---

## MODEL.VIEW_CLASS Integration

When a TablePage row is clicked:
1. TableView calls `getItemViewClass(model)`
2. Checks `model.constructor.VIEW_CLASS`
3. If found, instantiates the view in a dialog
4. If not found, falls back to a generic data modal

Define in the **view file** (not the model):
```javascript
import { Contact } from '../../models/Contact.js';
import ContactView from './ContactView.js';

Contact.VIEW_CLASS = ContactView;
```

---

## Standalone TableView (Without TablePage)

For embedding tables in dashboards or detail views:

```javascript
import { TableView } from 'web-mojo';

this.logsTable = new TableView({
  containerId: 'logs-table',
  collection: logsCollection,
  fetchOnMount: true,
  columns: [
    { key: 'created|datetime', label: 'Time' },
    { key: 'level', label: 'Level' },
    { key: 'log', label: 'Details' },
  ],
  emptyMessage: 'No activity logged yet',
  hideActivePillNames: ['model_name', 'model_id'],
});
this.addChild(this.logsTable);
```

---

## Complete Example: Contacts TablePage

```javascript
import { TablePage } from 'web-mojo';
import { ContactList } from '../../models/Contact.js';
// VIEW_CLASS binding happens in ContactView.js

export default class ContactsPage extends TablePage {
  constructor(options = {}) {
    super({
      pageName: 'contacts',
      title: 'Contacts',
      icon: 'bi-people',
      permissions: ['view_contacts'],
      requiresGroup: true,
      Collection: ContactList,
      defaultQuery: { sort: '-created' },

      columns: [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'email|email', label: 'Email', sortable: true,
          filter: { type: 'text', placeholder: 'Search email...' } },
        { key: 'status', label: 'Status',
          template: '<span class="badge bg-{{model.getStatusBadge}}">{{model.status|upper}}</span>',
          filter: {
            type: 'select',
            options: [
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ],
          },
        },
        { key: 'created|relative', label: 'Created', sortable: true, visibility: 'md' },
      ],

      viewDialogOptions: { header: false, size: 'lg' },

      tableViewOptions: {
        showAdd: true,
        addForm: 'CREATE_FORM',
        searchable: true,
        paginated: true,
      },

      ...options,
    });
  }
}
```

---

## Anti-Patterns to Avoid

| Wrong | Right | Why |
|-------|-------|-----|
| `width: '120px'` | `class: 'w-auto'` | `width` is not a supported column property |
| `{ key: 'name', template: '{{model.name}}' }` | `{ key: 'name' }` | Redundant template — key already renders the field |
| `{ key: 'date', template: '{{model.date\|datetime}}' }` | `{ key: 'date\|datetime' }` | Use pipe in key instead of template |
| `formatter: (v) => v.toUpperCase()` | `key: 'name\|upper'` | Use built-in formatter, not function |
| Manual URL param parsing | `defaultQuery: { sort: '-created' }` | TablePage handles URL sync |
| Fetching in `onAfterRender()` | Collection auto-fetches | Let the framework manage data loading |
