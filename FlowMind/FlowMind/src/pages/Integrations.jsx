import React, { useEffect, useState } from 'react';
import { Settings, RefreshCw, Power } from 'lucide-react';
import { getIntegrations } from '../api';
import './Integrations.css';

const Integrations = () => {
  const [integrations, setIntegrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getIntegrations().then(data => {
      setIntegrations(data);
      setIsLoading(false);
    });
  }, []);

  const toggleConnection = (id) => {
    setIntegrations(integrations.map(int => {
      if (int.id === id) {
        return { ...int, status: int.status === 'connected' ? 'disconnected' : 'connected' };
      }
      return int;
    }));
  };

  return (
    <div className="integrations-page fade-in-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Integrations</h1>
          <p className="page-subtitle">Connect your apps to FlowMind Gateway</p>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-state">Loading integrations...</div>
      ) : (
        <div className="grid-cards">
          {integrations.map(integration => (
            <div className="card int-card" key={integration.id}>
              <div className="int-header">
                <div className="int-logo capitalize">{integration.id.substring(0, 1)}</div>
                <div className={`status-dot ${integration.status === 'connected' ? 'online' : 'offline'}`} title={integration.status}></div>
              </div>
              
              <div className="int-body">
                <h3>{integration.name}</h3>
                <p className="int-desc">Configure the connection to {integration.name} for workflow execution.</p>
              </div>

              <div className="int-actions">
                {integration.status === 'connected' ? (
                  <button className="btn btn-secondary w-100" onClick={() => toggleConnection(integration.id)}>
                    <Power size={16} /> Disconnect
                  </button>
                ) : (
                  <button className="btn btn-primary w-100" onClick={() => toggleConnection(integration.id)}>
                    <RefreshCw size={16} /> Connect
                  </button>
                )}
                <button className="btn btn-icon btn-secondary">
                  <Settings size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Integrations;
