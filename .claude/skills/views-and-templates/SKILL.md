---
name: views-and-templates
description: Comprehensive reference for View lifecycle, templates, Mustache pipes, formatters, child views, Page lifecycle, and action handling in web-mojo
---

You are an expert on the web-mojo View system, template engine, and DataFormatter. Use this reference when building or modifying Views and Pages.

## View Constructor Options

```javascript
new View({
  tagName: 'div',              // HTML tag (default: 'div')
  className: 'my-view',       // CSS class
  id: 'unique-id',            // Element ID (auto-generated if omitted)
  containerId: 'slot-name',   // data-container slot in parent
  template: '...',            // String, function, or URL
  model: modelInstance,        // Model (auto-re-renders on change)
  data: {},                    // Template data object
  enableTooltips: false,       // Auto-init Bootstrap tooltips
  cacheTemplate: true,         // Cache compiled template
})
```

---

## View Lifecycle Hooks

All hooks are async. Called in this order during first render:

| Hook | When | Use For |
|------|------|---------|
| `onInit()` | Once, before first render | Fetch data, create child views, one-time setup |
| `onBeforeRender()` | Before template renders | Modify data, compute display properties |
| `onAfterRender()` | After HTML rendered, before DOM mount | DOM element exists but not in page yet |
| `onBeforeMount()` | Before appended to DOM | — |
| `onAfterMount()` | After appended to DOM, children mounted | DOM queries, 3rd-party widget init |
| `onBeforeUnmount()` | Before removed from DOM | — |
| `onAfterUnmount()` | After removed from DOM | — |
| `onBeforeDestroy()` | Before cleanup | Remove event listeners, timers |
| `onAfterDestroy()` | After cleanup | — |

### Critical Rules

- **Fetch data in `onInit()`** or action handlers. NEVER in `onAfterRender()` or `onAfterMount()`.
- `onInit()` fires only once (controlled by `this.initialized` flag).
- For Pages, per-visit logic goes in `onEnter()`, not `onInit()`.

---

## Page Lifecycle

Pages extend View with routing and state preservation.

### Page-Specific Options

```javascript
new Page({
  pageName: 'my-page',        // Required — used for routing
  title: 'My Page',           // Browser title
  icon: 'bi-file-text',       // Bootstrap icon
  permissions: ['view_stuff'], // Required permissions
  requiresGroup: true,        // Require active group
})
```

### Page Hooks

| Hook | When | Use For |
|------|------|---------|
| `onEnter()` | Page becomes active (each visit) | Refresh data, update state |
| `onExit()` | Leaving this page | Save state, cleanup |
| `onParams(params, query)` | Route params received | Handle URL parameters |
| `onGroupChange(group)` | Active group changed | Re-fetch group-scoped data |

### Page Methods

```javascript
this.navigate(route, params)           // Navigate to another page
this.getApp().showPage('contacts')     // Navigate by page name
this.syncUrl()                         // Update browser URL
```

---

## Child Views & Containers

### Pattern: data-container + addChild

```html
<!-- Parent template -->
<div>
  <div data-container="header"></div>
  <div data-container="content"></div>
</div>
```

```javascript
async onInit() {
  this.headerView = new View({
    containerId: 'header',
    model: this.model,
    template: '<h2>{{model.name}}</h2>',
  });
  this.addChild(this.headerView);

  this.contentView = new DataView({
    containerId: 'content',
    model: this.model,
    fields: [...]
  });
  this.addChild(this.contentView);
}
```

### Rules

- Always set `containerId` on the child, matching `data-container` in the parent.
- Use `this.addChild(childView)` — **never** manually call `child.render()` or `child.mount()`.
- Pass `model: this.model` to share data with children.

---

## Template System (Mustache)

The View instance IS the template context. Any `this.*` property is available.

### Variable Output

```html
{{name}}                          <!-- escaped output -->
{{{htmlContent}}}                 <!-- raw HTML (triple braces — trusted only!) -->
{{model.first_name}}              <!-- model property -->
{{model.getDisplayName}}          <!-- model helper method (no parens) -->
```

### Boolean Conditionals

```html
<!-- IMPORTANT: use |bool for boolean checks -->
{{#model.is_active|bool}}
  <span class="badge bg-success">Active</span>
{{/model.is_active|bool}}

{{^model.is_active|bool}}
  <span class="badge bg-secondary">Inactive</span>
{{/model.is_active|bool}}
```

**Without `|bool`, Mustache treats the value as an array/object and iterates it.**

### Iteration

```html
{{#items}}
  <div>{{_index}}: {{name}} - {{email}}</div>
{{/items}}

{{^items}}
  <p>No items found</p>
{{/items}}
```

### Pipe Formatters in Templates

```html
{{model.created|datetime}}                  <!-- Apr 12, 2026 3:45 PM -->
{{model.created|date:'YYYY-MM-DD'}}        <!-- 2026-04-12 (quote string args!) -->
{{model.name|upper}}                        <!-- JOHN DOE -->
{{model.amount|currency}}                   <!-- $12.50 (expects cents) -->
{{model.created|epoch|datetime}}            <!-- chain: epoch → datetime -->
```

---

## DataFormatter — Complete Pipe Reference

### Date/Time

| Pipe | Output | Notes |
|------|--------|-------|
| `date` | MM/DD/YYYY | Custom: `date:'YYYY-MM-DD'` |
| `datetime` | Apr 12, 2026 3:45 PM | |
| `datetime_tz` | Apr 12, 2026 3:45 PM EST | With timezone |
| `time` | 15:45:00 | Custom: `time:'HH:mm'` |
| `relative` | 2 hours ago | |
| `relative_short` | 2h ago | |
| `epoch` | Convert seconds→ms | Chain: `epoch\|datetime` |
| `iso` | ISO 8601 | |

**Date format tokens:** `YYYY`, `YY`, `MMMM` (January), `MMM` (Jan), `MM` (01), `M` (1), `dddd` (Monday), `ddd` (Mon), `DD` (01), `D` (1)

**Time tokens:** `HH` (24h), `hh` (12h), `mm`, `ss`, `A` (AM/PM), `a` (am/pm)

### Numbers

| Pipe | Output | Notes |
|------|--------|-------|
| `number` | 1,234 | `number:2` for decimals |
| `currency` | $12.50 | Input in cents. `currency:'€':2` |
| `percent` | 85% | `percent:1` for decimals |
| `filesize` | 1.2 MB | |
| `ordinal` | 1st, 2nd, 3rd | |
| `compact` | 1.2K, 5M | |

### Math

| Pipe | Example |
|------|---------|
| `add:10` | Add 10 |
| `subtract:5` / `sub:5` | Subtract 5 |
| `multiply:2` / `mult:2` | Multiply by 2 |
| `divide:4` / `div:4` | Divide by 4 |

### Text

| Pipe | Output | Notes |
|------|--------|-------|
| `upper` / `uppercase` | UPPERCASE | |
| `lower` / `lowercase` | lowercase | |
| `capitalize` / `caps` | Title Case | |
| `truncate:60` | Long text... | `truncate:60:'→'` custom suffix |
| `truncate_front:8` | ...ng text | |
| `truncate_middle:8` | Lo***xt | |
| `slug` | my-slug-text | |
| `initials` | JD | From "John Doe" |
| `mask:'*':4` | ****5678 | Show last 4 |
| `replace:'old':'new'` | String replace | |

### HTML/Display

| Pipe | Output | Notes |
|------|--------|-------|
| `email` | Clickable link | |
| `phone` | Formatted phone | |
| `url` | Clickable URL | `url:'Click here'` |
| `badge` | Bootstrap badge | Auto-colors by value |
| `status` | Status with color | |
| `boolean` | True/False | `boolean:'Yes':'No':true` |
| `bool` | JS boolean | For conditional checks |
| `yesno` | Yes/No | |
| `yesnoicon` | ✓/✗ icons | |
| `avatar:md` | Circular image | Sizes: xs, sm, md, lg, xl |
| `image` | Image tag | |
| `tooltip:'Help'` | Bootstrap tooltip | |
| `clipboard` | Copy button | |
| `linkify` | Auto-link URLs | |
| `highlight:'term'` | Highlight text | |
| `nl2br` | Newlines → `<br>` | |
| `code` | `<pre><code>` | |
| `json:2` | Pretty JSON | |
| `stripHtml` | Remove HTML | |

### Utility

| Pipe | Output | Notes |
|------|--------|-------|
| `default:'N/A'` | Fallback if empty | |
| `equals:val:'yes':'no'` | Conditional | |
| `plural:'item':'items'` | 1 item / 2 items | |
| `list` | a, b, and c | Array formatting |
| `duration` | 1h 30m | `duration:'ms':'short':2` |
| `iter` | Make iterable | Object → `[{key, value}]` |
| `keys` | Object keys | |
| `values` | Object values | |
| `raw` | No formatting | |

### Chaining Pipes

```html
{{model.created|epoch|datetime}}           <!-- timestamp → datetime -->
{{model.name|truncate:30|upper}}           <!-- truncate then uppercase -->
{{model.amount|currency|default:'N/A'}}    <!-- currency with fallback -->
{{model.status|upper|badge}}               <!-- uppercase then badge -->
```

---

## Action Handling

### data-action → Handler Methods

```html
<button data-action="save">Save</button>          <!-- → onActionSave(event, el) -->
<button data-action="delete-item">Delete</button>  <!-- → onActionDeleteItem(event, el) -->
```

```javascript
async onActionSave(event, element) {
  await this.model.save();
  this.getApp().toast.success('Saved');
}

async onActionDeleteItem(event, element) {
  const confirmed = await this.getApp().modal.confirm('Delete?');
  if (confirmed) {
    await this.model.destroy();
  }
}
```

### Other Action Types

```html
<!-- Page navigation -->
<a data-page="contacts">Go to Contacts</a>
<a data-page="user" data-params='{"id": 123}'>User 123</a>

<!-- Clipboard -->
<button data-clipboard="text to copy">Copy</button>

<!-- Change action (inputs) -->
<input data-change-action="filter">
```

### Rules

- Place `data-action` on **buttons**, never on `<form>`, `<input>`, or `<select>`.
- Kebab-case in HTML → camelCase in handler: `data-action="my-thing"` → `onActionMyThing()`.

---

## App Services (via this.getApp())

See the **app-services** skill for full reference on `app.rest`, `app.toast`, `app.modal`, `app.events`, navigation, user/group context, and more.

```javascript
const app = this.getApp();
app.rest.GET(url, params)       // HTTP requests
app.toast.success(message)      // Notifications
app.modal.confirm(message)      // Dialogs
app.events.on(event, handler)   // Event bus
app.showPage(pageName, query)   // Navigation
app.activeUser                  // Current user
app.getActiveGroup()            // Current group
app.showLoading(message)        // Loading overlay
```

---

## View Properties

| Property | Description |
|----------|-------------|
| `this.element` / `this.el` | DOM element |
| `this.model` | Current model |
| `this.data` | Template data object |
| `this.children` | Child views `{ id → View }` |
| `this.parent` | Parent View |
| `this.initialized` | True after first `onInit()` |
| `this.mounted` | True when in DOM |

---

## Common View Patterns

### Stats Card View

```javascript
class StatsView extends View {
  constructor(options = {}) {
    super(options);
    this.stats = { total: 0, active: 0 };
  }

  async getTemplate() {
    return `
      <div class="row">
        <div class="col-md-6">
          <div class="card"><div class="card-body">
            <h6 class="text-muted">Total</h6>
            <h3>{{stats.total|number}}</h3>
          </div></div>
        </div>
      </div>
    `;
  }

  async onBeforeRender() {
    await this.loadStats();
  }

  async loadStats() {
    const resp = await this.getApp().rest.GET('/api/myapp/stats');
    if (resp?.data?.data) Object.assign(this.stats, resp.data.data);
  }
}
```

### Detail View with Tabs

```javascript
class ItemView extends View {
  async onInit() {
    await this.model.fetch();

    this.tabView = new TabView({
      containerId: 'tabs',
      tabs: {
        'Overview': new DataView({ model: this.model, fields: [...] }),
        'Activity': new TableView({ collection: logsCollection, ... }),
      },
    });
    this.addChild(this.tabView);
  }

  async getTemplate() {
    return `
      <div>
        <h5>{{model.name}}</h5>
        <div data-container="tabs"></div>
      </div>
    `;
  }
}
```

---

## Anti-Patterns

| Wrong | Right |
|-------|-------|
| Fetch in `onAfterRender()` | Fetch in `onInit()` or `onBeforeRender()` |
| `child.render(); child.mount()` | `this.addChild(child)` |
| `{{#model.active}}` (without bool) | `{{#model.active\|bool}}` |
| `this.runner = data` | `this.model = new Model(data)` |
| `this.items.toArray()` | `this.items.models` |
| Unescaped user input `{{{userInput}}}` | Only `{{{trustedHtml}}}` |
