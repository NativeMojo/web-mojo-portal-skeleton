/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DETAIL VIEW — Complete reference for model detail dialogs
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Detail views are shown when clicking a row in a TablePage.
 * The connection is: Model.VIEW_CLASS = MyDetailView
 *
 * Structure:
 *   View (container)
 *     ├─ Header View (badges, title, action buttons)
 *     └─ TabView
 *          ├─ DataView (key-value fields)
 *          ├─ TableView (related records)
 *          └─ FormView (inline editing)
 */

import { View, DataView, TabView, TableView, LogList } from 'web-mojo';
// import { MyModel } from '../../models/MyModel.js';

class MyDetailView extends View {
  constructor(options = {}) {
    super({
      className: 'my-detail-view',

      // Root template with containers for child views
      template: `
        <div>
          <div data-container="view-header"></div>
          <div data-container="view-tabs" class="m-3"></div>
        </div>
      `,
      ...options,
    });
  }

  async onInit() {
    // Fetch full model data (table rows may only have summary fields)
    await this.model.fetch();

    // ── Header ──────────────────────────────────────────────────────────
    this.headerView = new View({
      containerId: 'view-header',
      model: this.model,
      template: `
        <div class="d-flex justify-content-between align-items-start p-3 border-bottom">
          <div>
            <span class="badge bg-{{model.getStatusBadge}}">{{model.status|upper}}</span>
            <h5 class="mt-2 mb-0">{{model.getDisplayName}}</h5>
          </div>
          <div class="btn-group">
            <button class="btn btn-sm btn-outline-primary" data-action="edit">
              <i class="bi bi-pencil"></i> Edit
            </button>
          </div>
        </div>
      `,
    });
    this.addChild(this.headerView);

    // ── Tab: Overview (DataView) ────────────────────────────────────────
    // DataView renders model fields as a responsive key-value grid.
    this.overviewView = new DataView({
      model: this.model,
      showEmptyValues: true,
      fields: [
        { name: 'first_name', label: 'First Name', colSize: 6 },
        { name: 'last_name', label: 'Last Name', colSize: 6 },
        { name: 'email', label: 'Email', colSize: 6 },
        { name: 'phone', label: 'Phone', colSize: 6 },
        { name: 'status', label: 'Status', colSize: 6 },

        // Format options: 'datetime', 'datetime_tz', 'date', 'relative',
        //                 'currency', 'number', 'yesno', 'badge'
        { name: 'created', label: 'Created', colSize: 6, format: 'datetime_tz' },
      ],
    });

    // ── Tab: Activity Log ───────────────────────────────────────────────
    // LogList is a built-in Collection for the django-mojo audit log.
    const logsCollection = new LogList({
      params: {
        size: 25,
        model_name: 'myapp.MyModel',     // Django model label
        model_id: this.model.id,
      },
    });

    this.logsView = new TableView({
      collection: logsCollection,
      fetchOnMount: true,
      hideActivePillNames: ['model_name', 'model_id'],
      columns: [
        { key: 'created|epoch|datetime', label: 'Time' },
        { key: 'level', label: 'Level' },
        { key: 'kind', label: 'Kind', visibility: 'md' },
        { key: 'log', label: 'Details' },
      ],
      emptyMessage: 'No activity logged yet',
      fontSize: 'small',
    });

    // ── Assemble Tabs ───────────────────────────────────────────────────
    this.tabView = new TabView({
      containerId: 'view-tabs',
      tabs: {
        'Overview': this.overviewView,
        'Activity': this.logsView,
      },
      activeTab: 'Overview',
    });
    this.addChild(this.tabView);
  }

  // ── Action Handlers ─────────────────────────────────────────────────────
  // data-action="edit" → onActionEdit()

  async onActionEdit() {
    const app = this.getApp();

    // Show model's EDIT_FORM in a modal dialog
    // const result = await app.modal.showForm(MyModel.EDIT_FORM, { model: this.model });
    // if (result) {
    //   await this.model.save(result);
    //   app.toast.success('Saved');
    //   await this.model.fetch();
    //   await this.render();
    // }
  }
}

// ── VIEW_CLASS Binding ──────────────────────────────────────────────────────
// This is what connects a Model to its detail view.
// MyModel.VIEW_CLASS = MyDetailView;

export default MyDetailView;
