import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Settings, RefreshCw, Power } from 'lucide-react';
import { connectIntegration, disconnectIntegration, getIntegrations } from '../api';
import './Integrations.css';

const Integrations = () => {
  const location = useLocation();
  const [integrations, setIntegrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeService, setActiveService] = useState(null);

  const loadIntegrations = async () => {
    const data = await getIntegrations();
    setIntegrations(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadIntegrations().catch((error) => {
      console.error('Failed to load integrations', error);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (
      params.get('gmail') === 'connected' ||
      params.get('github') === 'connected' ||
      params.get('notion') === 'connected'
    ) {
      loadIntegrations().catch(console.error);
    }
  }, [location.search]);

  const toggleConnection = async (integration) => {
    try {
      setActiveService(integration.id);
      if (integration.status === 'connected') {
        await disconnectIntegration(integration.id);
        await loadIntegrations();
        return;
      }

      const result = await connectIntegration(integration.id);
      if (result.authUrl) {
        window.location.href = result.authUrl;
        return;
      }

      await loadIntegrations();
    } catch (error) {
      console.error('Failed to toggle integration', error);
    } finally {
      setActiveService(null);
    }
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
                  <button className="btn btn-secondary w-100" onClick={() => toggleConnection(integration)} disabled={activeService === integration.id}>
                    <Power size={16} /> Disconnect
                  </button>
                ) : (
                  <button className="btn btn-primary w-100" onClick={() => toggleConnection(integration)} disabled={activeService === integration.id}>
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
