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
    { number: '1', title: 'Manage Diseases', subtitle: 'Add, update or delete diseases in the system', action: 'Manage', icon: '🦠', onClick: () => onSectionSelect('diseases') },
    { number: '2', title: 'Manage Symptoms', subtitle: 'Add or update symptoms and their details.', action: 'Manage', icon: '📋', onClick: () => onSectionSelect('symptoms') },
    { number: '3', title: 'Manage Specialists', subtitle: 'Add or update specialist doctors.', action: 'Manage', icon: '👨‍⚕️', onClick: () => onSectionSelect('specialists') },
    { number: '4', title: 'Manage Tests', subtitle: 'Add, update or delete medical tests.', action: 'Manage', icon: '⚗️', onClick: () => onSectionSelect('tests') },
    { number: '5', title: 'Manage Hospitals', subtitle: 'Add or update hospitals information.', action: 'Manage', icon: '🏥', onClick: () => onSectionSelect('hospitals') },
    { number: '6', title: 'View Users & Queries', subtitle: 'View users and their submitted queries.', action: 'View', icon: '📨', onClick: () => onSectionSelect('users') },
    { number: '7', title: 'View Query Management', subtitle: 'Review and remove submitted user queries.', action: 'View', icon: '📋', onClick: onQueries },
    { number: '8', title: 'View Analytics & Reports', subtitle: 'View system analytics and reports.', action: 'View', icon: '📊', onClick: onAnalytics },
    { number: '9', title: 'Logout', subtitle: 'Securely logout from the admin panel.', action: 'Logout', icon: '➡️', isLogout: true },
  ];

  return (
    <div className="admin-dashboard-shell">
      <aside className="admin-dashboard-sidebar">
        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-logo">❤️</div>
          <div>
            <p className="admin-sidebar-title">MediGuide</p>
            <p className="admin-sidebar-subtitle">Admin Panel</p>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          <button className="admin-nav-item admin-nav-item--active" type="button">Dashboard</button>
          <button className="admin-nav-item" type="button" onClick={() => onSectionSelect('diseases')}>Manage Diseases</button>
          <button className="admin-nav-item" type="button" onClick={() => onSectionSelect('symptoms')}>Manage Symptoms</button>
          <button className="admin-nav-item" type="button" onClick={() => onSectionSelect('specialists')}>Manage Specialists</button>
          <button className="admin-nav-item" type="button" onClick={() => onSectionSelect('tests')}>Manage Tests</button>
          <button className="admin-nav-item" type="button" onClick={() => onSectionSelect('hospitals')}>Manage Hospitals</button>
          <button className="admin-nav-item" type="button" onClick={() => onSectionSelect('users')}>View Users & Queries</button>
          <button className="admin-nav-item" type="button" onClick={onAnalytics}>View Analytics & Reports</button>
        </nav>

        <button className="admin-sidebar-logout" type="button" onClick={onLogout}>
          Logout
        </button>
      </aside>

      <main className="admin-dashboard-main">
        <header className="admin-dashboard-header">
          <div>
            <p className="admin-welcome-pretitle">Welcome, <strong>{userName}</strong> 👋</p>
            <h1>Here&apos;s what&apos;s happening with MediGuide today.</h1>
          </div>
          <div className="admin-header-right">
            <button className="admin-icon-button" type="button" aria-label="Notifications">🔔</button>
            <div className="admin-user-chip">
              <div className="admin-user-chip-avatar">A</div>
              <div className="admin-user-chip-info">
                <p className="admin-user-chip-name">Admin</p>
                <p className="admin-user-chip-role">Administrator</p>
              </div>
            </div>
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

        <section className="admin-actions-grid">
          {actionCards.map((item) => (
            <article key={item.title} className="admin-action-card">
              <div className="admin-action-icon">{item.icon}</div>
              <p className="admin-action-number">{item.number}. {item.title}</p>
              <p className="admin-action-subtitle">{item.subtitle}</p>
              <button
                type="button"
                className={`admin-action-button ${item.isLogout ? 'admin-action-button--danger' : ''}`}
                onClick={item.isLogout ? onLogout : () => item.onClick && item.onClick()}
              >
                {item.action} →
              </button>
            </article>
          ))}
        </section>

        <section className="admin-dashboard-footer">
          <div>
            <p className="admin-footer-title">MediGuide AI System</p>
            <p className="admin-footer-copy">Manage and monitor the healthcare recommendation system.</p>
          </div>
          <div className="admin-footer-meta">
            <span>Last Login</span>
            <strong>{loginTime}</strong>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
