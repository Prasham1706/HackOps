import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, CheckCircle, Clock, Plus } from 'lucide-react';
import { getDashboardSummary, getWorkflows } from '../api';
import './Dashboard.css';

const Dashboard = () => {
  const [workflows, setWorkflows] = useState([]);
  const [summary, setSummary] = useState({
    totalWorkflows: 0,
    avgSuccessRate: 0,
    avgLatencyMs: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const formatLatency = (latencyMs) => {
    if (!latencyMs || latencyMs <= 0) return '—';
    if (latencyMs >= 1000) return `${(latencyMs / 1000).toFixed(1)}s`;
    return `${Math.round(latencyMs)}ms`;
  };

  const formatTimestamp = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
  };

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [workflowData, summaryData] = await Promise.all([
          getWorkflows(),
          getDashboardSummary(),
        ]);
        setWorkflows(workflowData);
        setSummary(summaryData);
        setLoadError('');
      } catch (error) {
        console.error('Failed to load dashboard', error);
        setLoadError('Unable to load live dashboard metrics right now.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  return (
    <div className="dashboard-page fade-in-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your automated AI workflows</p>
        </div>
        <Link to="/builder" className="btn btn-primary">
          <Plus size={18} /> New Workflow
        </Link>
      </div>

      {loadError ? <div className="integration-error-banner">{loadError}</div> : null}

      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon"><Play className="text-accent" /></div>
          <div className="stat-info">
            <h3>{summary.totalWorkflows}</h3>
            <p>Total Workflows</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon"><CheckCircle className="text-success" /></div>
          <div className="stat-info">
            <h3>{summary.avgSuccessRate.toFixed(1)}%</h3>
            <p>Avg Success Rate</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon"><Clock className="text-warn" /></div>
          <div className="stat-info">
            <h3>{formatLatency(summary.avgLatencyMs)}</h3>
            <p>Avg Latency</p>
          </div>
        </div>
      </div>

      <div className="card table-card">
        <div className="table-header">
          <h3>Recent Workflows</h3>
        </div>
        {isLoading ? (
          <div className="loading-state">Loading workflows...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Last Run</th>
                <th>Success Rate</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {workflows.map(wf => (
                <tr key={wf.id}>
                  <td className="fw-500">{wf.name}</td>
                  <td>
                    <span className={`badge ${
                      wf.status === 'DONE'
                        ? 'badge-success'
                        : wf.status === 'FAILED'
                          ? 'badge-danger'
                          : 'badge-warn'
                    }`}>
                      {wf.status}
                    </span>
                  </td>
                  <td className="text-secondary">{formatTimestamp(wf.lastRun)}</td>
                  <td>{wf.successRate}</td>
                  <td>
                    <Link to="/builder" className="btn btn-secondary btn-sm">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
