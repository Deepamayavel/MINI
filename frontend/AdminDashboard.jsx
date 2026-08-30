import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import { getAdminAnalytics, listAdminResources } from '../src/api.js';

const AdminDashboard = ({ userName = 'Admin', token, onLogout, onSectionSelect, onAnalytics, onQueries }) => {
  const [stats, setStats] = useState(null);
  const [hospitalCount, setHospitalCount] = useState('…');
  const [loginTime] = useState(() => new Date().toLocaleString());

  useEffect(() => {
    if (!token) return;
    getAdminAnalytics(token)
      .then((data) => setStats(data))
      .catch(() => {});
    listAdminResources(token, 'hospitals', 0, 1)
      .then((data) => setHospitalCount(data.totalElements ?? data.content?.length ?? 0))
      .catch(() => setHospitalCount(0));
  }, [token]);

  const summaryCards = [
    { title: 'Users', value: stats ? stats.totalUsers : '…', icon: '👤' },
    { title: 'Queries Today', value: stats ? stats.activeUsersToday : '…', icon: '🔍' },
    { title: 'Total Queries', value: stats ? stats.totalQueries : '…', icon: '📊' },
    { title: 'Recommendations', value: stats ? stats.totalRecommendations : '…', icon: '🩺' },
    { title: 'Hospitals', value: hospitalCount, icon: '🏥' },
  ];

  const actionCards = [
    { number: '1', title: 'Manage Diseases', subtitle: 'Add, update or delete diseases in the ontology knowledge base.', action: 'Manage', icon: '🦠', onClick: () => onSectionSelect('diseases') },
    { number: '2', title: 'Manage Symptoms', subtitle: 'Add or update symptom entities and multilingual synonyms.', action: 'Manage', icon: '📋', onClick: () => onSectionSelect('symptoms') },
    { number: '3', title: 'Manage Specialists', subtitle: 'Add or update specialist doctors and practitioner roles.', action: 'Manage', icon: '👨‍⚕️', onClick: () => onSectionSelect('specialists') },
    { number: '4', title: 'Manage Tests', subtitle: 'Add, update or configure diagnostic medical tests.', action: 'Manage', icon: '⚗️', onClick: () => onSectionSelect('tests') },
    { number: '5', title: 'Manage Hospitals', subtitle: 'Add, edit or update hospital facilities and locations.', action: 'Manage', icon: '🏥', onClick: () => onSectionSelect('hospitals') },
    { number: '6', title: 'View Users & Roles', subtitle: 'Inspect registered user profiles and role permissions.', action: 'View', icon: '👥', onClick: () => onSectionSelect('users') },
    { number: '7', title: 'Query Management', subtitle: 'Review and manage real-time submitted patient queries.', action: 'View', icon: '📨', onClick: onQueries },
    { number: '8', title: 'Analytics & Reports', subtitle: 'Inspect prediction accuracy, daily trends, and graphs.', action: 'View', icon: '📊', onClick: onAnalytics },
  ];

  return (
    <div className="admin-dashboard-shell">
      <aside className="admin-dashboard-sidebar">
        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-logo">❤️</div>
          <div>
            <p className="admin-sidebar-title">MediGuide</p>
            <p className="admin-sidebar-subtitle">Admin Console</p>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          <button className="admin-nav-item admin-nav-item--active" type="button">
            <span>🏠</span> Dashboard
          </button>
          <button className="admin-nav-item" type="button" onClick={() => onSectionSelect('diseases')}>
            <span>🦠</span> Manage Diseases
          </button>
          <button className="admin-nav-item" type="button" onClick={() => onSectionSelect('symptoms')}>
            <span>📋</span> Manage Symptoms
          </button>
          <button className="admin-nav-item" type="button" onClick={() => onSectionSelect('specialists')}>
            <span>👨‍⚕️</span> Manage Specialists
          </button>
          <button className="admin-nav-item" type="button" onClick={() => onSectionSelect('tests')}>
            <span>⚗️</span> Manage Tests
          </button>
          <button className="admin-nav-item" type="button" onClick={() => onSectionSelect('hospitals')}>
            <span>🏥</span> Manage Hospitals
          </button>
          <button className="admin-nav-item" type="button" onClick={() => onSectionSelect('users')}>
            <span>👥</span> View Users
          </button>
          <button className="admin-nav-item" type="button" onClick={onQueries}>
            <span>📨</span> Query Log
          </button>
          <button className="admin-nav-item" type="button" onClick={onAnalytics}>
            <span>📊</span> Analytics & Reports
          </button>
        </nav>

        <button className="admin-sidebar-logout" type="button" onClick={onLogout}>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Sign Out</span>
        </button>
      </aside>

      <main className="admin-dashboard-main">
        <header className="admin-dashboard-header">
          <div>
            <p className="admin-welcome-pretitle">Welcome back, <strong>{userName}</strong> 👋</p>
            <h1>Administrator Console</h1>
          </div>
          <div className="admin-header-right">
            <div className="admin-user-chip">
              <div className="admin-user-chip-avatar">A</div>
              <div className="admin-user-chip-info">
                <p className="admin-user-chip-name">{userName}</p>
                <p className="admin-user-chip-role">System Administrator</p>
              </div>
            </div>
            <button className="admin-header-logout-btn" type="button" onClick={onLogout} title="Logout of Admin Session">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </header>

        <section className="admin-summary-grid">
          {summaryCards.map((card) => (
            <article key={card.title} className="admin-summary-card">
              <div className="admin-summary-icon">{card.icon}</div>
              <p className="admin-summary-title">{card.title}</p>
              <h2>{card.value}</h2>
              {card.detail && <span>{card.detail}</span>}
            </article>
          ))}
        </section>

        <div className="admin-actions-section-header">
          <h2>Core Management Modules</h2>
          <p>Quick access to ontology management, diagnostic rules, and system logs</p>
        </div>

        <section className="admin-actions-grid">
          {actionCards.map((item) => (
            <article key={item.title} className="admin-action-card">
              <div className="admin-action-icon">{item.icon}</div>
              <p className="admin-action-number">{item.number}. {item.title}</p>
              <p className="admin-action-subtitle">{item.subtitle}</p>
              <button
                type="button"
                className="admin-action-button"
                onClick={() => item.onClick && item.onClick()}
              >
                {item.action} →
              </button>
            </article>
          ))}
        </section>

        <section className="admin-dashboard-footer">
          <div>
            <p className="admin-footer-title">MediGuide AI Ontology Administration</p>
            <p className="admin-footer-copy">Connected to MongoDB Atlas & Apache Jena RDF Knowledge Graph.</p>
          </div>
          <div className="admin-footer-meta">
            <span>Session Started</span>
            <strong>{loginTime}</strong>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
