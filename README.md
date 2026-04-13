# web-mojo-portal-skeleton

Admin portal skeleton built with [web-mojo](https://github.com/NativeMojo/web-mojo). Pairs with [django-mojo-skeleton](https://github.com/NativeMojo/django-mojo-skeleton) for the backend.

## Quick Start

```bash
git clone --depth 1 https://github.com/NativeMojo/web-mojo-portal-skeleton.git portal && cd portal && rm -rf .git && git init
```

```bash
npm install
npm run dev
```

On first run, a **setup wizard** opens in your browser to connect the portal to your django-mojo backend. It will:
1. Ask which port your backend is running on (default 9009)
2. Test the connection
3. Save the config and launch the portal

Auth is handled by a **local login page** (`auth/index.html`) using `mojo-auth.js` — a standalone vanilla JS library that calls the django-mojo backend API. Because the auth page runs on the same origin as the portal, localStorage is shared and JWT tokens work seamlessly. Make sure your backend is running (`./bin/run_dev_server`) before or during setup.

The setup creates `config/dev_server.conf` with a **random portal port** (5000-9800) to avoid collisions with other projects. To re-run setup, delete this file and restart `npm run dev`.

## Update Project References

- `package.json` — name, description
- `portal/index.html` — page title
- `portal/src/config.js` — production API URL, brand name
- `auth/index.html` — login page branding, production API URL
- `config/dev_server.conf` — local dev ports (auto-generated, git-ignored)
- `CLAUDE.md` — project description

## Project Structure

```
auth/
├── index.html              # Standalone login page (same origin as portal)
├── mojo-auth.js            # Vanilla JS auth library (login, OAuth, passkeys, magic links)
└── mojo-auth.css           # Auth page styles

portal/src/
├── init.js                 # Auth gate → lazy-loads portal.js
├── portal.js               # App bootstrap, registers pages + menus
├── config.js               # API URL, brand, feature flags
├── version.js              # Semantic version (auto-generated)
├── style.css               # Custom CSS overrides
│
├── models/                 # Shared data models (used by all menu sections)
│   └── Contact.js          # Example: Model + Collection + forms
│
├── main/                   # Primary group-scoped menu section
│   ├── menu.js             # Sidebar menu config
│   ├── pages.js            # Page registration
│   ├── pages/
│   │   ├── HomePage.js         # Landing page (Page)
│   │   ├── DashboardPage.js    # Metrics dashboard (Page + child Views)
│   │   ├── ContactsPage.js     # Data table (TablePage)
│   │   └── SettingsPage.js     # Group settings (FormPage, auto-save)
│   └── views/
│       └── ContactView.js      # Detail dialog (View + VIEW_CLASS)
│
├── admin/                  # Global admin menu section (not group-scoped)
│   ├── menu.js
│   ├── pages.js
│   └── pages/
│       └── ContactsAdminPage.js
│
└── examples/               # Copy-paste references (not imported by the app)
    ├── app-services.js     # app.rest, app.toast, app.modal, app.events
    ├── templates.md        # Mustache template cheat sheet
    ├── table-page.js       # TablePage reference
    ├── detail-view.js      # Detail View reference
    ├── form-page.js        # FormPage reference
    ├── dashboard-page.js   # Dashboard reference
    └── model.js            # Model + Collection reference
```

## How It Works

### Adding a New Menu Section

1. Create a folder: `portal/src/billing/`
2. Add `menu.js`, `pages.js`, and `pages/` + `views/` subdirectories
3. Import and register in `portal.js`:
   ```js
   import { registerBillingPages } from './billing/pages.js';
   import { registerBillingMenu } from './billing/menu.js';
   // ... in bootstrap():
   registerBillingPages(app);
   registerBillingMenu(app);
   ```

### Adding a New Page

1. Create the page in the appropriate section's `pages/` folder
2. Register it in that section's `pages.js`
3. Add a menu item in that section's `menu.js`

### Page Types

| Type | Use Case | Example |
|------|----------|---------|
| `Page` | Custom layouts, dashboards | `DashboardPage.js` |
| `TablePage` | Data grids with sort/filter/search | `ContactsPage.js` |
| `FormPage` | Settings forms with auto-save | `SettingsPage.js` |

### Key Concepts

- **VIEW_CLASS** — Bind a View to a Model: `Contact.VIEW_CLASS = ContactView`. TablePage uses this when a row is clicked.
- **data-container** — Template slots for child Views: `<div data-container="my-chart"></div>` + `this.addChild(new View({ containerId: 'my-chart' }))`
- **data-action** — Button event mapping: `data-action="save"` → `onActionSave(event, element)`
- **Formatters** — Template pipes: `{{model.created|relative}}`, `{{model.name|upper}}`

## AI-Assisted Development

This skeleton ships with `.claude/` rules and skills that teach Claude Code the web-mojo framework — so it writes correct code instead of guessing APIs.

| Category | What It Covers |
|----------|---------------|
| **Rules** (`rules/`) | Framework conventions, forbidden patterns, lifecycle rules |
| **Skills** (`skills/`) | Detailed API references for TableView, Forms, Modals, Charts, Navigation, and more |
| **Examples** (`portal/src/examples/`) | Copy-paste references with inline documentation |
| **CLAUDE.md** | Project-level conventions and doc links |

## Build for Production

```bash
npm run build    # Outputs to dist/
npm run preview  # Preview the production build
```

## License

Apache 2.0
