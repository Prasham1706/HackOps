import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, Zap, ArrowRight, Activity } from 'lucide-react';
import Navbar from '../components/Navbar';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      <Navbar />
      <main className="hero">
        <div className="hero-content">
          <div className="badge badge-accent fade-in-up">Introducing FlowMind Version 1.0</div>
          <h1 className="hero-title fade-in-up delay-1">
            Build AI Workflows from <span className="highlight">Natural Language</span>
          </h1>
          <p className="hero-subtitle fade-in-up delay-2">
            The intelligent MCP Gateway to orchestrate GitHub, Notion, and Gmail with zero code and self-healing execution.
          </p>
          <div className="hero-actions fade-in-up delay-3">
            <Link to="/login" className="btn btn-primary btn-lg">
              Get Started <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              View Demo
            </Link>
          </div>
        </div>
        
        <div className="hero-visual fade-in-up delay-4">
          <div className="glass-card visual-mockup">
            <div className="mockup-header">
              <div className="mockup-dots"><span></span><span></span><span></span></div>
            </div>
            <div className="mockup-body">
              <div className="mockup-node node-gmail"><Bot size={16}/> Gmail Trigger</div>
              <div className="mockup-edge"></div>
              <div className="mockup-node node-notion"><Activity size={16}/> Analyze Content</div>
              <div className="mockup-edge active"></div>
              <div className="mockup-node node-github"><Zap size={16}/> Push to GitHub</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
