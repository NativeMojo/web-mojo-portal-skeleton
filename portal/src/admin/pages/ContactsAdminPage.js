/**
 * ContactsAdminPage — Global admin TablePage (not group-scoped)
 *
 * Same TablePage pattern as the group-scoped ContactsPage but without
 * requiresGroup, so it shows contacts across all groups.
 */

import { TablePage } from 'web-mojo';
import { ContactList } from '../../models/Contact.js';

export default class ContactsAdminPage extends TablePage {
  constructor(options = {}) {
    super({
      pageName: 'ContactsAdminPage',
      title: 'All Contacts',
      icon: 'bi-people-fill',

      Collection: ContactList,
      defaultQuery: { sort: '-created' },

      columns: [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'name', label: 'Name', sortable: true },
        {
          key: 'email|default("--")',
          label: 'Email',
          sortable: true,
          filter: { type: 'text', placeholder: 'Search email...' },
        },
        {
          key: 'contact_type',
          label: 'Type',
          template: '<span class="badge bg-{{model.getTypeBadge}}">{{model.contact_type|upper|default("--")}}</span>',
          filter: {
            type: 'select',
            options: [
              { value: '', label: 'All' },
              { value: 'person', label: 'Person' },
              { value: 'company', label: 'Company' },
            ],
          },
        },
        {
          key: 'status',
          label: 'Status',
          template: '<span class="badge bg-{{model.getStatusBadge}}">{{model.status|upper|default("--")}}</span>',
          filter: {
            type: 'select',
            options: [
              { value: '', label: 'All' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'flagged', label: 'Flagged' },
            ],
          },
        },
        { key: 'created|relative', label: 'Created', sortable: true, visibility: 'md' },
      ],

      viewDialogOptions: { header: false },
      tableViewOptions: { showAdd: false },

      ...options,
    });
  }
}
