---
globs: ["portal/src/models/**/*.js"]
---

# Model & Collection Rules

## Models
- Models extend `Model`. Constructor calls `super(data, { endpoint })`.
- The endpoint must match a django-mojo REST handler URL (e.g., `/api/myapp/items`).
- Access data: `this.model.get('field')`, mutate: `this.model.set('field', value)`.
- Define helper methods for templates: `getDisplayName()`, `getStatusBadge()`.
- Helpers are callable in Mustache: `{{model.getDisplayName}}`.

## Collections
- Collections extend `Collection` with `ModelClass` and `endpoint`.
- Set `size` for default page size.
- Collection has no `toArray()` — use `collection.models` or `collection.toJSON()`.

## Form Definitions
- Attach as static properties: `Model.CREATE_FORM`, `Model.EDIT_FORM`.
- Form fields: `{ name, label, type, columns (1-12), required, help, placeholder, options }`.
- Field types: text, email, password, number, tel, url, date, textarea, select, checkbox, radio, file, hidden, color, toggle, tagInput, datePicker, dateRange, multiSelect, collectionSelect, imageField.
- Structural types: tabset, header, divider, html, button.
- Use `Model.FORM_DIALOG_CONFIG = { size: 'lg' }` for dialog sizing.

## VIEW_CLASS
- Bind in the view file: `MyModel.VIEW_CLASS = MyDetailView`.
- Never define VIEW_CLASS in the model file itself.

## REST API
- Standard CRUD endpoints. Admins filter with query params (e.g., `?user=123`).
- Response envelope: `{ status: true, data: {...} }`.
- List response: `{ status: true, data: [...], count, start, size }`.
- REST responses are nested — payload is at `resp.data.data`.
