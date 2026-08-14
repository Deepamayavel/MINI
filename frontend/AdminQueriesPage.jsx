import React, { useEffect, useState } from 'react';
import './AdminQueriesPage.css';
import { deleteAdminResource, listAdminResources } from '../src/api.js';

const AdminQueriesPage = ({ token, onBack, onLogout }) => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadQueries = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await listAdminResources(token, 'queries', 0, 50);
      setQueries(data.content || []);
    } catch (err) {
      setError(err.message || 'Unable to load queries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadQueries();
    }
  }, [token]);

  const handleDelete = async (queryId) => {
    if (!window.confirm('Delete this query?')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await deleteAdminResource(token, 'queries', queryId);
      setQueries((prev) => prev.filter((query) => query.id !== queryId));
    } catch (err) {
      setError(err.message || 'Unable to delete query');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-queries-shell">
      <header className="admin-queries-header">
        <div>
          <button type="button" className="admin-back-button" onClick={onBack}>
            ← Back to Admin Dashboard
          </button>
          <h1>Query Management</h1>
          <p>Review and remove user symptom queries from the system.</p>
        </div>
        <button type="button" className="admin-logout-button" onClick={onLogout}>
          Logout
        </button>
      </header>

      {error && <div className="admin-queries-error">{error}</div>}
      {loading && <div className="admin-queries-loading">Loading queries…</div>}

      <div className="admin-queries-grid">
        {queries.map((query) => (
          <article key={query.id} className="admin-query-card">
            <div className="admin-query-card-header">
              <div>
                <h2>{query.predictedDisease || 'Unknown Condition'}</h2>
                <span>{new Date(query.timestamp).toLocaleString()}</span>
              </div>
              <button type="button" className="admin-query-delete" onClick={() => handleDelete(query.id)}>
                Delete
              </button>
            </div>
            <div className="admin-query-meta">
              <span>User: {query.userId || 'Unknown'}</span>
              <span>Confidence: {query.confidenceScore ? `${Math.round(query.confidenceScore * 100)}%` : 'N/A'}</span>
            </div>
            <p className="admin-query-text">{query.rawText}</p>
          </article>
        ))}
      </div>

      {!loading && queries.length === 0 && (
        <div className="admin-queries-empty">
          <h2>No queries found</h2>
          <p>There are no submitted queries available right now.</p>
        </div>
      )}
    </div>
  );
};

export default AdminQueriesPage;
