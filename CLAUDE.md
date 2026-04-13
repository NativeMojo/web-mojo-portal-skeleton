# web-mojo Portal Skeleton

Admin portal built with [web-mojo](https://github.com/NativeMojo/web-mojo), paired with [django-mojo](https://github.com/NativeMojo/django-mojo) on the backend.

## Quick Reference

```bash
npm install        # Install dependencies
npm run dev        # Dev server (auto-configured on first run)
npm run build      # Production build → dist/
```

## Documentation

- **web-mojo framework docs:** https://raw.githubusercontent.com/NativeMojo/web-mojo/refs/heads/main/docs/web-mojo/README.md
- **django-mojo REST API docs:** https://raw.githubusercontent.com/NativeMojo/django-mojo/refs/heads/main/docs/web_developer/README.md

When you need details on a framework component (View, Page, TableView, Model, etc.), fetch the relevant doc from the web-mojo docs index above. Do not guess API behavior.

## Architecture

```
portal/src/
  models/              # Shared data models (used by all menu sections)
  main/                # Primary group menu (pages, views, menu.js)
  admin/               # Global admin menu (pages, views, menu.js)
  examples/            # Copy-paste references (not imported by the app)
```

## Page Types

| Type | Use Case | Base Class |
|------|----------|------------|
| `Page` | Custom layouts, dashboards, child View composition | `Page` |
| `TablePage` | Data grids with sort, filter, search, pagination | `TablePage` |
| `FormPage` | Settings forms with auto-save to group.metadata | `FormPage` |

## Key Patterns

- `Model.VIEW_CLASS = MyView` — binds a detail View to a Model. TablePage opens this in a dialog on row click.
- `data-container="name"` + `this.addChild(view)` — child View composition via named slots.
- `data-action="kebab-case"` → `onActionKebabCase(event, element)` — event handling.
- `this.getApp()` — access `app.rest`, `app.toast`, `app.modal`, `app.events`, `app.showPage()`.

## Conventions

- No type hints in JavaScript.
- One page per file, one view per file.
- Models in `models/` (shared), pages and views in their menu section folder.
- Business logic in model helpers or services, not in page handlers.
- Permissions on every page registration.
- Bootstrap 5.3 for layout/styling, Bootstrap Icons for icons.

## Critical Rules

### Templates (Mustache)
- The View instance IS the template context. Use `{{model.field}}` for model data.
- Use `{{#flag|bool}}` for boolean checks — plain `{{#flag}}` iterates arrays.
- Use `{{{triple braces}}}` for trusted HTML that must not be escaped.
- Quote string formatter arguments: `{{date|date:'YYYY-MM-DD'}}`.
- Prefer pipe formatters over inline JS: `{{model.created|relative}}`, `{{model.name|upper}}`.
- Chain formatters: `{{model.created|epoch|datetime}}`.

### Views & Pages
- Fetch data in `onInit()` or action handlers. **Never** in `onAfterRender()` or `onAfterMount()`.
- For cached pages, per-visit logic belongs in `onEnter()`, not the constructor.
- Use `addChild()` with `containerId`. **Never** manually call `child.render()` or `child.mount()`.
- Primary data object is `this.model`. Use `this.model.get('field')` in JS.

### TablePage / TableView
- Columns do **NOT** support a `width` property. Use CSS classes via `class:` instead.
- Let the column `key` do the work with pipe formatters: `{ key: 'created|datetime', label: 'Created' }`.
- Do **NOT** add a `template` property to columns unless you need custom HTML beyond what formatters provide.
- Always include filter support where appropriate — either in column config or table-level filters.
- Use `defaultQuery: { sort: '-created' }` for initial sort, not custom fetch logic.

### REST API
- Standard CRUD endpoints. Admins filter with query params — no separate admin endpoints.
- Response envelope: `{ status: true, data: {...} }` or `{ status: true, data: [...], count, start, size }`.
- Use `app.rest.GET/POST/PUT/DELETE()` — handles auth headers automatically.

### What NOT to Do
- Do not add `width` to table column configs.
- Do not use `template` in columns when a formatter or pipe suffices.
- Do not invent ad-hoc data holder names (`this.runner`, `this.device`) — use `this.model`.
- Do not fetch data in render lifecycle hooks.
- Do not manually manage child view rendering.
- Do not hardcode secrets, tokens, or environment-specific values.
