import axios from 'axios';
import { invalidateCache, readThroughCache } from './utils/cacheRegistry';

// Base API URL
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle 401 Unauthorized (auto-logout)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────────────
export const loginUser = async (email, password) => {
  const { data } = await api.post('/api/auth/login', { email, password });
  return data;
};

export const registerUser = async (email, password, name) => {
  const { data } = await api.post('/api/auth/register', { email, password, name });
  return data;
};

export const loginWithGoogle = async (googleIdToken) => {
  const { data } = await api.post('/api/auth/google', { token: googleIdToken });
  return data;
};

// ─── Workflow ────────────────────────────────────────────────────
export const generateWorkflow = async (payload) => {
  const { data } = await api.post('/api/workflow/generate', payload);
  invalidateCache('workflows', 'dashboard-summary');
  return data;
};

export const refineWorkflow = async (workflowId, refinementPrompt) => {
  const { data } = await api.post('/api/workflow/refine', { workflowId, refinementPrompt });
  invalidateCache('workflows', 'dashboard-summary');
  return data;
};

export const simulateWorkflow = async (workflowId) => {
  const { data } = await api.post('/api/workflow/simulate', { workflowId });
  return data;
};

export const configureWorkflow = async (workflowId, nodeInputs) => {
  const { data } = await api.post('/api/workflow/configure', { workflowId, nodeInputs });
  return data;
};

export const approveWorkflow = async (workflowId, decisions) => {
  const { data } = await api.post('/api/workflow/approve', { workflowId, decisions });
  return data;
};

export const executeWorkflow = async (workflowId) => {
  const { data } = await api.post('/api/workflow/execute', { workflowId });
  invalidateCache('workflows', 'dashboard-summary');
  return data;
};

export const getWorkflows = async () => {
  return readThroughCache('workflows', 15000, async () => {
    const { data } = await api.get('/api/workflows');
    return data;
  });
};

export const getDashboardSummary = async () => {
  return readThroughCache('dashboard-summary', 15000, async () => {
    const { data } = await api.get('/api/dashboard/summary');
    return data;
  });
};

// ─── Genomes ─────────────────────────────────────────────────────
export const getGenomes = async () => {
  return readThroughCache('genomes', 60000, async () => {
    const { data } = await api.get('/api/genome/list');
    return data;
  });
};

export const cloneGenome = async (genomeId) => {
  const { data } = await api.post('/api/genome/clone', { genomeId });
  invalidateCache('genomes', 'workflows', 'dashboard-summary');
  return data;
};

// ─── Integrations ────────────────────────────────────────────────
export const getIntegrations = async () => {
  return readThroughCache('integrations', 30000, async () => {
    const { data } = await api.get('/api/integrations/status');
    return data;
  });
};

export const connectIntegration = async (service) => {
  const { data } = await api.post('/api/integrations/connect', { service });
  invalidateCache('integrations');
  return data;
};

export const disconnectIntegration = async (service) => {
  const { data } = await api.delete('/api/integrations/disconnect', { data: { service } });
  invalidateCache('integrations');
  return data;
};

export default api;
