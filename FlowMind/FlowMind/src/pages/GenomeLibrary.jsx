import React, { useEffect, useState } from 'react';
import { Copy, Star, Download } from 'lucide-react';
import { getGenomes } from '../api';
import './GenomeLibrary.css';

const GenomeLibrary = () => {
  const [genomes, setGenomes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getGenomes().then(data => {
      setGenomes(data);
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="genome-page fade-in-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Genome Library</h1>
          <p className="page-subtitle">Clone pre-built successful AI workflows templates</p>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-state">Loading genomes...</div>
      ) : (
        <div className="grid-cards">
          {genomes.map(genome => (
            <div className="card genome-card" key={genome.id}>
              <div className="genome-header">
                <h3>{genome.name}</h3>
                <Star size={18} className="text-warn" />
              </div>
              
              <div className="genome-meta">
                <p>Fitness Score</p>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${genome.fitness}%` }}></div>
                </div>
                <span className="fitness-value">{genome.fitness}% confidence</span>
              </div>

              <div className="services-used">
                <p className="meta-label">Services Included:</p>
                <div className="service-badges">
                  {genome.services.map(srv => (
                    <span key={srv} className="badge badge-accent capitalize">{srv}</span>
                  ))}
                </div>
              </div>

              <div className="genome-actions">
                <button className="btn btn-secondary w-100">
                  <Copy size={16} /> Clone to Workspace
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GenomeLibrary;
