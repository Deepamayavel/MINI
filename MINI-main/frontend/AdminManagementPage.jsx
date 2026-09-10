import React, { useEffect, useState } from 'react';
import './AdminManagementPage.css';
import {
  createAdminResource,
  deleteAdminResource,
  listAdminResources,
  updateAdminResource,
} from '../src/api.js';

const RESOURCE_CONFIG = {
  diseases: {
    title: 'Disease Management',
    subtitle: 'Create, edit, and remove disease records.',
    endpoint: 'diseases',
    listFields: [
      { key: 'name', label: 'Name' },
      { key: 'description', label: 'Description' },
      { key: 'severityScore', label: 'Severity' },
    ],
    formFields: [
      { name: 'name', label: 'Name', type: 'text' },
      { name: 'description', label: 'Description', type: 'text' },
      { name: 'severityScore', label: 'Severity Score', type: 'number' },
    ],
    empty: () => ({ name: '', description: '', severityScore: 0 }),
  },
  symptoms: {
    title: 'Symptom Management',
    subtitle: 'Add or update available symptom definitions.',
    endpoint: 'symptoms',
    listFields: [
      { key: 'name', label: 'Name' },
      { key: 'description', label: 'Description' },
    ],
    formFields: [
      { name: 'name', label: 'Name', type: 'text' },
      { name: 'description', label: 'Description', type: 'text' },
    ],
    empty: () => ({ name: '', description: '' }),
  },
  specialists: {
    title: 'Specialist Management',
    subtitle: 'Manage doctor specialties and associated hospital IDs.',
    endpoint: 'specialists',
    listFields: [
      { key: 'name', label: 'Name' },
      { key: 'specialty', label: 'Specialty' },
      { key: 'hospitalId', label: 'Hospital ID' },
    ],
    formFields: [
      { name: 'name', label: 'Name', type: 'text' },
      { name: 'specialty', label: 'Specialty', type: 'text' },
      { name: 'hospitalId', label: 'Hospital ID', type: 'text' },
    ],
    empty: () => ({ name: '', specialty: '', hospitalId: '' }),
  },
  tests: {
    title: 'Test Management',
    subtitle: 'Add, edit, or remove diagnostic tests.',
    endpoint: 'tests',
    listFields: [
      { key: 'name', label: 'Name' },
      { key: 'description', label: 'Description' },
    ],
    formFields: [
      { name: 'name', label: 'Name', type: 'text' },
      { name: 'description', label: 'Description', type: 'text' },
    ],
    empty: () => ({ name: '', description: '' }),
  },
  hospitals: {
    title: 'Hospital Management',
    subtitle: 'Add or update hospital contact information.',
    endpoint: 'hospitals',
    listFields: [
      { key: 'name', label: 'Name' },
      { key: 'address', label: 'Address' },
      { key: 'contact', label: 'Contact' },
    ],
    formFields: [
      { name: 'name', label: 'Name', type: 'text' },
      { name: 'address', label: 'Address', type: 'text' },
      { name: 'contact', label: 'Contact', type: 'text' },
    ],
    empty: () => ({ name: '', address: '', contact: '' }),
  },
  users: {
    title: 'User Management',
    subtitle: 'Review, update, or deactivate user accounts.',
    endpoint: 'users',
    listFields: [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Role' },
    ],
    formFields: [
      { name: 'name', label: 'Name', type: 'text' },
      { name: 'email', label: 'Email', type: 'text' },
      { name: 'role', label: 'Role', type: 'text' },
    ],
    empty: () => ({ name: '', email: '', role: 'USER' }),
  },
};

const AdminManagementPage = ({ token, resource: initialResource = 'diseases', onBack, onLogout }) => {
  const [resource, setResource] = useState(initialResource);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState(RESOURCE_CONFIG[resource].empty());
  const [editItem, setEditItem] = useState(null);

  const config = RESOURCE_CONFIG[resource] || RESOURCE_CONFIG.diseases;

  useEffect(() => {
    setResource(initialResource);
  }, [initialResource]);

  useEffect(() => {
    setError('');
    setFormData(config.empty());
    setEditItem(null);
    if (token) {
      loadItems();
    }
  }, [resource, token]);

  const loadItems = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await listAdminResources(token, config.endpoint);
      setItems(data.content || []);
    } catch (err) {
      setError(err.message || 'Unable to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = { ...formData };
      config.formFields.forEach((field) => {
        if (field.type === 'number') {
          payload[field.name] = payload[field.name] === '' ? null : Number(payload[field.name]);
        }
      });

      if (editItem) {
        delete payload.id;
        await updateAdminResource(token, config.endpoint, editItem.id, payload);
      } else {
        await createAdminResource(token, config.endpoint, payload);
      }

      await loadItems();
      setFormData(config.empty());
      setEditItem(null);
    } catch (err) {
      setError(err.message || 'Unable to save changes');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setFormData({ ...item });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await deleteAdminResource(token, config.endpoint, id);
      await loadItems();
    } catch (err) {
      setError(err.message || 'Unable to delete record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-management-shell">
      <header className="admin-management-header">
        <div>
          <button type="button" className="admin-back-button" onClick={onBack}>
            ← Back to Admin Dashboard
          </button>
          <h1>{config.title}</h1>
          <p>{config.subtitle}</p>
        </div>
        <button type="button" className="admin-logout-button" onClick={onLogout}>
          Logout
        </button>
      </header>

      <section className="admin-management-tabs">
        {Object.entries(RESOURCE_CONFIG).map(([key, item]) => (
          <button
            key={key}
            type="button"
            className={`admin-management-tab ${key === resource ? 'admin-management-tab--active' : ''}`}
            onClick={() => setResource(key)}
          >
            {item.title.replace(' Management', '')}
          </button>
        ))}
      </section>

      <div className="admin-management-grid">
        <aside className="admin-management-panel">
          <div className="admin-form-card">
            <h2>{editItem ? `Edit ${config.title.replace(' Management', '')}` : `Add New ${config.title.replace(' Management', '')}`}</h2>
            <form className="admin-form" onSubmit={handleSubmit}>
              {config.formFields.map((field) => (
                <label key={field.name} className="admin-field">
                  <span>{field.label}</span>
                  <input
                    type={field.type}
                    value={formData[field.name] ?? ''}
                    onChange={(event) => handleInputChange(field.name, event.target.value)}
                  />
                </label>
              ))}
              <button className="admin-submit-button" type="submit" disabled={loading}>
                {editItem ? 'Save Changes' : 'Create Record'}
              </button>
              {editItem && (
                <button
                  type="button"
                  className="admin-cancel-button"
                  onClick={() => {
                    setEditItem(null);
                    setFormData(config.empty());
                  }}
                >
                  Cancel
                </button>
              )}
            </form>
            {error && <div className="admin-error-message">{error}</div>}
          </div>
        </aside>

        <main className="admin-management-content">
          <div className="admin-list-header">
            <h2>{config.title}</h2>
            <span>{items.length} records loaded</span>
          </div>

          {loading && <div className="admin-loading">Loading…</div>}

          <div className="admin-table-wrapper">
          <div className="admin-table">
            <div className="admin-table-row admin-table-row--header">
              {config.listFields.map((field) => (
                <div key={field.key} className="admin-table-cell admin-table-cell--header">
                  {field.label}
                </div>
              ))}
              <div className="admin-table-cell admin-table-cell--header">Actions</div>
            </div>
            {items.map((item) => (
              <div key={item.id} className="admin-table-row admin-table-row--item">
                {config.listFields.map((field) => (
                  <div key={field.key} className="admin-table-cell">
                    {item[field.key] ?? '-'}
                  </div>
                ))}
                <div className="admin-table-cell admin-table-actions">
                  <button type="button" onClick={() => handleEdit(item)}>
                    Edit
                  </button>
                  <button type="button" className="admin-delete-button" onClick={() => handleDelete(item.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminManagementPage;
