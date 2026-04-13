---
globs: ["portal/src/**/pages/*.js", "portal/src/**/views/*.js"]
---

# View & Page Rules

## Views
- Views extend `View`. Keep file names PascalCase matching the class name.
- Compose UI with child views and `data-container` slots.
- Primary data is `this.model`. JS reads: `this.model.get('field')`. Templates read: `{{model.field}}`.
- Child views receive `model: this.model`.
- Use `addChild()` with `containerId`. Never manually `render()` or `mount()` children.

## Pages
- Routed screens extend `Page`, `TablePage`, or `FormPage`.
- Pages are cached — per-visit logic goes in `onEnter()`, not constructor or `onInit()`.
- Always register with `permissions: [...]`.

## TablePage
- Pass `Collection` class (not instance) and `columns` array.
- Column `key` supports pipe formatters: `{ key: 'created|datetime', label: 'Created' }`.
- Do NOT add `width` to columns — not supported. Use `class` for sizing.
- Do NOT add `template` to columns unless you need custom HTML beyond formatters.
- Include `filter` config on columns where filtering makes sense.
- Use `defaultQuery: { sort: '-created' }` for initial ordering.
- Use `viewDialogOptions: { header: false, size: 'lg' }` when VIEW_CLASS has its own header.

## FormPage
- Fields with `metadata.*` names auto-read/write from `group.metadata`.
- `autosaveModelField: true` saves on every field change (no submit button needed).
- Protected metadata: `metadata.protected.*` requires admin permissions.

## Actions
- `data-action="save"` → `onActionSave(event, element)`.
- Place `data-action` on buttons, never on `<form>` or input elements.

## Detail Views (VIEW_CLASS)
- Define `Model.VIEW_CLASS = MyDetailView` in the view file, not the model file.
- TablePage auto-opens this in a dialog when a row is clicked.
- Fetch full model data in `onInit()` since table rows may only have summary fields.
