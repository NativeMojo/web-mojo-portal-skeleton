/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FORM PAGE — Complete reference for settings/config pages
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * FormPage automatically creates a form bound to the active group.
 * With autosaveModelField: true, every field change is saved immediately.
 *
 * Fields with 'metadata.*' names read/write from group.metadata.
 * Fields with 'metadata.protected.*' write to protected metadata
 * (requires admin permissions on the backend).
 *
 * No custom JavaScript needed — purely declarative.
 */

import { FormPage } from 'web-mojo';

export default class MySettingsPage extends FormPage {
  constructor(options = {}) {
    super({
      pageName: 'MySettingsPage',
      title: 'Settings',
      icon: 'bi-gear',
      permissions: ['manage_group', 'sys.manage_groups'],
      requiresGroup: true,

      // Auto-save each field change (no submit button needed)
      autosaveModelField: true,

      fields: [
        {
          // Tabbed layout — each tab is a section of fields
          type: 'tabset',
          tabs: [
            {
              label: 'General',
              fields: [
                // ── Text Inputs ──────────────────────────────────────
                { type: 'text', name: 'metadata.company_name', label: 'Company Name', columns: 6 },
                { type: 'email', name: 'metadata.admin_email', label: 'Admin Email', columns: 6 },
                { type: 'url', name: 'metadata.website', label: 'Website', columns: 6,
                  placeholder: 'https://example.com' },
                { type: 'tel', name: 'metadata.phone', label: 'Phone', columns: 6 },

                // ── Number ───────────────────────────────────────────
                { type: 'number', name: 'metadata.max_items', label: 'Max Items', columns: 6,
                  min: 1, max: 1000 },

                // ── Select Dropdown ──────────────────────────────────
                { type: 'select', name: 'metadata.region', label: 'Region', columns: 6,
                  options: [
                    { value: 'us-east', label: 'US East' },
                    { value: 'us-west', label: 'US West' },
                    { value: 'eu', label: 'Europe' },
                  ]
                },

                // ── Textarea ─────────────────────────────────────────
                { type: 'textarea', name: 'metadata.notes', label: 'Notes', columns: 12 },
              ],
            },
            {
              label: 'Features',
              fields: [
                // ── Toggle Switches ──────────────────────────────────
                { type: 'toggle', name: 'metadata.feature_notifications', label: 'Enable Notifications', columns: 6 },
                { type: 'toggle', name: 'metadata.feature_api_access', label: 'API Access', columns: 6 },
                { type: 'toggle', name: 'metadata.feature_webhooks', label: 'Webhooks', columns: 6 },
                { type: 'toggle', name: 'metadata.feature_exports', label: 'Data Exports', columns: 6 },
              ],
            },
            {
              label: 'Branding',
              fields: [
                { type: 'url', name: 'metadata.logo_url', label: 'Logo URL', columns: 6 },
                { type: 'color', name: 'metadata.primary_color', label: 'Primary Color', columns: 6 },

                // ── Protected metadata (requires admin perms) ────────
                { type: 'text', name: 'metadata.protected.branding.operator_name',
                  label: 'Operator Name', columns: 6,
                  help: 'Shown on consent screens' },
              ],
            },
            {
              label: 'Webhooks',
              fields: [
                { type: 'url', name: 'metadata.webhook_created', label: 'Item Created', columns: 12,
                  help: 'POST request sent when a new item is created',
                  placeholder: 'https://example.com/webhooks/created' },
                { type: 'url', name: 'metadata.webhook_updated', label: 'Item Updated', columns: 12,
                  help: 'POST request sent when an item is modified' },
              ],
            },
          ],
        },
      ],

      ...options,
    });
  }
}
