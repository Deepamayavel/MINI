import React, { useEffect, useState } from 'react';
import './AdminAnalyticsPage.css';
import { getAdminAnalytics } from '../src/api.js';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const COLORS = ['#2eaa72', '#4d7cff', '#f28f2d', '#8f6cff', '#e06464'];

const AdminAnalyticsPage = ({ token, onBack, onLogout }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError('');
    getAdminAnalytics(token)
      .then((data) => setAnalytics(data))
      .catch((err) => setError(err.message || 'Unable to load analytics'))
      .finally(() => setLoading(false));
  }, [token]);

  const diseaseChartData = analytics?.mostCommonPredictedDiseases?.map((d) => ({
    name: d.disease,
    count: d.count,
  })) || [];

  const queryChartData = Object.entries(analytics?.queriesPerDay || {})
    .slice(-14)
    .map(([day, count]) => ({ day: day.slice(5), count }));

  return (
    <div className="admin-analytics-shell">
      <header className="admin-analytics-header">
        <div>
          <button type="button" className="admin-back-button" onClick={onBack}>
            ← Back to Admin Dashboard
          </button>
          <h1>Analytics &amp; Reports</h1>
          <p>System usage, active users, and common conditions.</p>
        </div>
        <button type="button" className="admin-logout-button" onClick={onLogout}>
          Logout
        </button>
      </header>

      {loading && <div className="admin-loading">Loading analytics…</div>}
      {error && <div className="admin-error-message">{error}</div>}

      {analytics && (
        <>
          <div className="admin-analytics-grid">
            <section className="admin-analytics-card">
              <h2>Total Users</h2>
              <strong>{analytics.totalUsers}</strong>
            </section>
            <section className="admin-analytics-card">
              <h2>Total Queries</h2>
              <strong>{analytics.totalQueries}</strong>
            </section>
            <section className="admin-analytics-card">
              <h2>Total Recommendations</h2>
              <strong>{analytics.totalRecommendations}</strong>
            </section>
            <section className="admin-analytics-card">
              <h2>Active Users Today</h2>
              <strong>{analytics.activeUsersToday}</strong>
            </section>
          </div>

          <div className="admin-analytics-charts">
            <section className="admin-chart-panel">
              <h3>Top Predicted Diseases</h3>
              {diseaseChartData.length === 0 ? (
                <p className="admin-chart-empty">No data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={diseaseChartData} margin={{ top: 8, right: 16, left: 0, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8eff7" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-30} textAnchor="end" interval={0} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {diseaseChartData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </section>

            <section className="admin-chart-panel">
              <h3>Queries Per Day (Last 14 Days)</h3>
              {queryChartData.length === 0 ? (
                <p className="admin-chart-empty">No data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={queryChartData} margin={{ top: 8, right: 16, left: 0, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8eff7" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} angle={-30} textAnchor="end" interval={0} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#4d7cff" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </section>
          </div>

          <div className="admin-analytics-tables">
            <section className="analytics-trends-panel">
              <h3>Most Common Predicted Diseases</h3>
              <ul>
                {analytics.mostCommonPredictedDiseases?.map((item) => (
                  <li key={item.disease}>
                    <span>{item.disease}</span>
                    <strong>{item.count}</strong>
                  </li>
                ))}
              </ul>
            </section>
            <section className="analytics-trends-panel">
              <h3>Queries Per Day</h3>
              <ul>
                {Object.entries(analytics.queriesPerDay || {}).slice(-10).map(([day, count]) => (
                  <li key={day}>
                    <span>{day}</span>
                    <strong>{count}</strong>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAnalyticsPage;
