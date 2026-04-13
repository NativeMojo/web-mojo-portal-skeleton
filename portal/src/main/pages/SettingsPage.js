/**
 * SettingsPage — Group settings via FormPage with auto-save
 *
 * Demonstrates:
 *   - FormPage: specialized Page that auto-creates a form bound to the active group
 *   - Tabbed form layout (type: 'tabset')
 *   - Auto-save: changes are saved to group.metadata immediately on field change
 *   - Field types: toggle, text, select, number, email, url, color, textarea
 *   - Nested metadata paths: 'metadata.section.field_name'
 *   - No custom JavaScript needed — purely declarative configuration
 *
 * The form model is automatically the active group. Fields with 'metadata.*'
 * names read/write from group.metadata (a JSON object stored on the group).
 */

import { FormPage } from 'web-mojo';

export default class SettingsPage extends FormPage {
  constructor(options = {}) {
    super({
      pageName: 'SettingsPage',
      title: 'Settings',
      icon: 'bi-gear',
      permissions: ['manage_group', 'sys.manage_groups'],
      requiresGroup: true,

      // Auto-save each field change to the group model
      autosaveModelField: true,

      fields: [
        {
          type: 'tabset',
          tabs: [
            {
              label: 'General',
              fields: [
                {
                  type: 'text', name: 'metadata.display_name',
                  label: 'Display Name', columns: 6,
                  help: 'Public-facing name for this group',
                },
                {
                  type: 'email', name: 'metadata.support_email',
                  label: 'Support Email', columns: 6,
                },
                {
                  type: 'url', name: 'metadata.website_url',
                  label: 'Website', columns: 6,
                  placeholder: 'https://example.com',
                },
                {
                  type: 'select', name: 'metadata.timezone',
                  label: 'Timezone', columns: 6,
                  options: [
                    { value: 'America/New_York', label: 'Eastern' },
                    { value: 'America/Chicago', label: 'Central' },
                    { value: 'America/Denver', label: 'Mountain' },
                    { value: 'America/Los_Angeles', label: 'Pacific' },
                    { value: 'UTC', label: 'UTC' },
                  ],
                },
                {
                  type: 'textarea', name: 'metadata.description',
                  label: 'Description', columns: 12,
                },
              ],
            },
            {
              label: 'Notifications',
              fields: [
                {
                  type: 'toggle', name: 'metadata.notify_new_contact',
                  label: 'New Contact Notifications', columns: 6,
                  help: 'Send email when a new contact is created',
                },
                {
                  type: 'toggle', name: 'metadata.notify_status_change',
                  label: 'Status Change Alerts', columns: 6,
                  help: 'Alert when a contact status changes',
                },
                {
                  type: 'select', name: 'metadata.notification_method',
                  label: 'Notification Method', columns: 6,
                  options: [
                    { value: 'email', label: 'Email' },
                    { value: 'sms', label: 'SMS' },
                    { value: 'both', label: 'Both' },
                    { value: 'disabled', label: 'Disabled' },
                  ],
                },
              ],
            },
            {
              label: 'Branding',
              fields: [
                {
                  type: 'url', name: 'metadata.logo_url',
                  label: 'Logo URL', columns: 6,
                  placeholder: 'https://example.com/logo.png',
                },
                {
                  type: 'color', name: 'metadata.primary_color',
                  label: 'Primary Color', columns: 6,
                  help: 'Used for buttons and accents',
                },
              ],
            },
          ],
        },
      ],

      ...options,
    });
  }
}
