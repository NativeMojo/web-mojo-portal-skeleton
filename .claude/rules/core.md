# Core Rules

These rules apply to all work in this portal project. Non-negotiable.

## Project Context

This is a web-mojo portal application — a browser-side admin interface that talks to a django-mojo REST backend. The codebase is organized by menu sections (`main/`, `admin/`), with shared models in `models/` and copy-paste references in `examples/`.

## Before Editing

- Read the target file before editing. Match its local style.
- Read the relevant example in `portal/src/examples/` for the pattern you are using.
- When unsure about a framework component, fetch the web-mojo docs: https://raw.githubusercontent.com/NativeMojo/web-mojo/refs/heads/main/docs/web-mojo/README.md
- When unsure about backend API conventions, fetch the django-mojo docs: https://raw.githubusercontent.com/NativeMojo/django-mojo/refs/heads/main/docs/web_developer/README.md
- Check `portal/src/examples/` before writing new patterns — the answer is often already there.

## Framework Conventions

- Import from `web-mojo` (the published package), not internal paths.
- The primary data object for a view is `this.model`. In templates: `{{model.field}}`.
- Fetch data in `onInit()` or action handlers. **Never** in `onAfterRender()` or `onAfterMount()`.
- For cached pages, per-visit logic goes in `onEnter()`, not the constructor or `onInit()`.
- Use `addChild()` with `containerId`. Never manually call `child.render()` or `child.mount()`.
- `data-action="kebab-case"` maps to `onActionKebabCase(event, element)`.
- `data-container="name"` maps to child views with `containerId: 'name'`.
- Use `this.getApp()` to access `app.rest`, `app.toast`, `app.modal`, `app.events`.

## Template Rules

- The View instance is the Mustache context. Any `this.*` property is available as `{{property}}`.
- Use `{{model.field}}` for model data — not arbitrary context names.
- Use `{{#flag|bool}}` for boolean conditionals. Plain `{{#flag}}` iterates.
- Use `{{{triple braces}}}` only for trusted HTML.
- Use pipe formatters: `{{model.created|relative}}`, `{{model.name|upper}}`.
- Quote string formatter arguments: `{{model.created|date:'YYYY-MM-DD'}}`.
- Chain formatters with pipes: `{{model.created|epoch|datetime}}`.

## Styling

- Bootstrap 5.3 classes for layout and components.
- Bootstrap Icons (`bi bi-*`) for all icons.
- For loading states, use `showLoading()` / `hideLoading()`.

## Forbidden Actions

- Do not add `width` to table column configs — it is not supported.
- Do not use `template` in table columns when a formatter or pipe suffices.
- Do not invent ad-hoc data properties (`this.runner`, `this.device`) — use `this.model`.
- Do not fetch data in render lifecycle hooks.
- Do not manually manage child view rendering after `addChild()`.
- Do not hardcode secrets, tokens, or environment-specific values.
- Do not add tests, docs, or refactor unrelated files unless explicitly requested.

## Philosophy

- KISS — minimal, surgical changes that match existing patterns.
- Prefer declarative config over imperative code.
- Use the framework's built-in formatters and pipes instead of inline JavaScript.
- One page per file, one view per file.
- Business logic in model helpers, not page handlers.
- Permissions on every page registration.
