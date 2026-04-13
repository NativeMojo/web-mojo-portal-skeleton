/**
 * ContactView — Detail view shown when clicking a contact row
 *
 * Demonstrates:
 *   - VIEW_CLASS binding: Contact.VIEW_CLASS = ContactView
 *     When a TablePage row is clicked, the framework looks up the model's
 *     VIEW_CLASS and renders it in a dialog automatically.
 *
 *   - View composition: header View + TabView with child Views
 *   - DataView for key-value display
 *   - TabView for multi-section layout
 *   - data-action buttons → onAction* handlers
 *   - Using app.rest, app.toast, Modal from view.getApp()
 */

import { View, DataView, TabView, TableView, LogList } from 'web-mojo';
import { Contact } from '../../models/Contact.js';

class ContactView extends View {
  constructor(options = {}) {
    super({
      className: 'contact-view',
      template: `
        <div class="contact-container">
          <div data-container="view-header"></div>
          <div data-container="view-tabs" class="m-3"></div>
        </div>
      `,
      ...options,
    });
  }

  async onInit() {
    // Fetch the full model data (table rows may only have summary fields)
    await this.model.fetch();

    // ── Header ────────────────────────────────────────────────────────────
    this.headerView = new View({
      containerId: 'view-header',
      model: this.model,
      template: `
        <div class="d-flex justify-content-between align-items-start flex-wrap gap-3 p-3 border-bottom">
          <div>
            <div class="d-flex align-items-center gap-2 mb-2">
              <span class="badge bg-{{model.getStatusBadge}}">{{model.status|upper}}</span>
              <span class="badge bg-{{model.getTypeBadge}}">{{model.contact_type|upper}}</span>
            </div>
            <h5 class="mb-1">
              <i class="bi bi-person-circle me-2"></i>{{model.getDisplayName}}
            </h5>
            <div class="text-muted small">{{model.email}}</div>
          </div>
          <div class="btn-group">
            <button class="btn btn-sm btn-outline-primary" data-action="editContact">
              <i class="bi bi-pencil me-1"></i>Edit
            </button>
            <button class="btn btn-sm btn-outline-danger" data-action="deleteContact">
              <i class="bi bi-trash me-1"></i>Delete
            </button>
          </div>
        </div>
      `,
    });
    this.addChild(this.headerView);

    // ── Tab: Overview (DataView) ──────────────────────────────────────────
    this.overviewView = new DataView({
      model: this.model,
      showEmptyValues: true,
      fields: [
        { name: 'first_name', label: 'First Name', colSize: 6 },
        { name: 'last_name', label: 'Last Name', colSize: 6 },
        { name: 'email', label: 'Email', colSize: 6 },
        { name: 'phone', label: 'Phone', colSize: 6 },
        { name: 'contact_type', label: 'Type', colSize: 6 },
        { name: 'status', label: 'Status', colSize: 6 },
        { name: 'created', label: 'Created', colSize: 6, format: 'datetime_tz' },
        { name: 'modified', label: 'Updated', colSize: 6, format: 'datetime_tz' },
      ],
    });

    // ── Tab: Activity Log ─────────────────────────────────────────────────
    const logsCollection = new LogList({
      params: {
        size: 25,
        model_name: 'myapp.Contact',
        model_id: this.model.id,
      },
    });

    this.logsView = new TableView({
      collection: logsCollection,
      fetchOnMount: true,
      hideActivePillNames: ['model_name', 'model_id'],
      columns: [
        { key: 'created|epoch|datetime', label: 'Time', sortable: true },
        { key: 'level', label: 'Level' },
        { key: 'kind', label: 'Kind', visibility: 'md' },
        { key: 'log', label: 'Details' },
      ],
      emptyMessage: 'No activity logged yet',
      fontSize: 'small',
    });

    // ── Assemble Tabs ─────────────────────────────────────────────────────
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

  // ── Action Handlers ───────────────────────────────────────────────────────
  // data-action="editContact" → onActionEditContact()

  async onActionEditContact() {
    const app = this.getApp();

    // Show a FormView dialog using the model's EDIT_FORM definition
    const result = await app.modal.showForm(Contact.EDIT_FORM, { model: this.model });
    if (result) {
      // Form was submitted — save and refresh
      await this.model.save(result);
      app.toast.success('Contact updated');
      await this.model.fetch();
      await this.render();
    }
  }

  async onActionDeleteContact() {
    const app = this.getApp();

    const confirmed = await app.modal.confirm({
      title: 'Delete Contact',
      message: `Are you sure you want to delete ${this.model.getDisplayName()}?`,
      confirmLabel: 'Delete',
      confirmClass: 'btn-danger',
    });

    if (confirmed) {
      await this.model.destroy();
      app.toast.success('Contact deleted');
      this.close();  // Close the dialog
    }
  }
}

// ── VIEW_CLASS Binding ────────────────────────────────────────────────────────
// This tells the framework: "When you need to display a Contact, use ContactView."
// TablePage uses this automatically when a row is clicked.
Contact.VIEW_CLASS = ContactView;

export default ContactView;
