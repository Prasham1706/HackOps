import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, CheckCircle, Clock, Plus } from 'lucide-react';
import { getWorkflows } from '../api';
import './Dashboard.css';

const Dashboard = () => {
  const [workflows, setWorkflows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getWorkflows().then(data => {
      setWorkflows(data);
      setIsLoading(false);
    });
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

      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon"><Play className="text-accent" /></div>
          <div className="stat-info">
            <h3>{workflows.length}</h3>
            <p>Total Workflows</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon"><CheckCircle className="text-success" /></div>
          <div className="stat-info">
            <h3>98.2%</h3>
            <p>Avg Success Rate</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon"><Clock className="text-warn" /></div>
          <div className="stat-info">
            <h3>1.4s</h3>
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
                    <span className={`badge ${wf.status === 'active' ? 'badge-success' : 'badge-warn'}`}>
                      {wf.status}
                    </span>
                  </td>
                  <td className="text-secondary">{wf.lastRun}</td>
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
