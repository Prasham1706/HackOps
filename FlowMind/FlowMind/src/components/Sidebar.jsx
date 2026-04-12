import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Workflow, Library, Plug, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-panel">
        <div className="sidebar-intro">
          <span className="sidebar-kicker">Command Center</span>
          <p>Shape workflows, inspect genomes, and connect the tools your automations depend on.</p>
        </div>
      <div className="sidebar-nav">
        <NavLink to="/dashboard" className={({isActive}) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/builder" className={({isActive}) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
          <Workflow size={20} />
          <span>Workflow Builder</span>
        </NavLink>
        <NavLink to="/library" className={({isActive}) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
          <Library size={20} />
          <span>Genome Library</span>
        </NavLink>
        <NavLink to="/integrations" className={({isActive}) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
          <Plug size={20} />
          <span>Integrations</span>
        </NavLink>
      </div>

      <div className="sidebar-footer">
        <button className="sidebar-link logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Log Out</span>
        </button>
      </div>
      </div>
    </aside>
  );
};

export default Sidebar;
