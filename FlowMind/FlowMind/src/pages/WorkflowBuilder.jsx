import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import { Sparkles, Play, ShieldAlert, Cpu } from 'lucide-react';
import { configureWorkflow, executeWorkflow, generateWorkflow, getIntegrations, simulateWorkflow } from '../api';
import './WorkflowBuilder.css';

const WorkflowBuilder = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [workflow, setWorkflow] = useState(null);
  const [simulation, setSimulation] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [connectedServices, setConnectedServices] = useState([]);
  const [nodeInputs, setNodeInputs] = useState({});
  const [isPreparingExecution, setIsPreparingExecution] = useState(false);

  useEffect(() => {
    const loadIntegrations = async () => {
      try {
        const integrations = await getIntegrations();
        const connected = integrations
          .filter((integration) => integration.status === 'connected')
          .map((integration) => integration.id);
        setConnectedServices(connected);
      } catch (error) {
        console.error('Failed to load integrations', error);
      }
    };

    loadIntegrations();
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setSimulation(null); // Reset sim
    try {
      const inferredServices = inferServicesFromPrompt(prompt, connectedServices);
      const data = await generateWorkflow({
        description: prompt,
        services: inferredServices,
      });
      const normalized = normalizeWorkflow(data);
      setWorkflow(normalized);
      setNodeInputs(extractEditableInputs(normalized.dag));
    } catch (error) {
      console.error('Failed to generate workflow', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSimulate = async () => {
    if (!workflow) return;
    setIsSimulating(true);
    try {
      const simData = await simulateWorkflow(workflow.id);
      setSimulation(simData);
    } catch (error) {
      console.error('Failed to simulate workflow', error);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleExecute = async () => {
    if (!workflow) return;
    try {
      if (hasMissingRequiredInputs(workflow.dag, nodeInputs)) {
        alert('Please fill in the required workflow inputs before executing.');
        return;
      }

      setIsPreparingExecution(true);
      await configureWorkflow(workflow.id, nodeInputs);
      const exec = await executeWorkflow(workflow.id);
      navigate('/execution', { state: { execId: exec.executionId, workflow } });
    } catch (e) {
      console.error(e);
    } finally {
      setIsPreparingExecution(false);
    }
  };

  const handleInputChange = (nodeId, fieldName, value) => {
    setNodeInputs((prev) => ({
      ...prev,
      [nodeId]: {
        ...(prev[nodeId] || {}),
        [fieldName]: value,
      },
    }));
  };

  return (
    <div className="builder-page fade-in-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Workflow Builder</h1>
          <p className="page-subtitle">Translate intent into automated execution</p>
        </div>
        {workflow && (
            <button className="btn btn-primary" onClick={handleExecute} disabled={isPreparingExecution}>
              <Play size={16} /> {isPreparingExecution ? 'Preparing...' : 'Execute Workflow'}
            </button>
        )}
      </div>

      <div className="builder-layout">
        <div className="builder-sidebar">
          {/* Section A: Natural Language Input */}
          <div className="card input-card">
            <h3>Natural Language Input</h3>
            <textarea 
              className="input prompt-area" 
              placeholder="E.g., Whenever a high-priority email arrives, summarize it using AI and save it to a Notion database..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button className="btn btn-secondary w-100" onClick={handleGenerate} disabled={isGenerating || !prompt.trim()}>
              {isGenerating ? 'Generating...' : <><Sparkles size={16} /> Generate Workflow</>}
            </button>
          </div>

          {workflow && hasEditableInputs(workflow.dag) && (
            <div className="card input-card">
              <h3>Workflow Inputs</h3>
              {(workflow.dag?.nodes || []).map((node) => {
                const editableFields = getEditableFields(node);
                if (!editableFields.length) return null;

                return (
                  <div key={node.id} className="workflow-input-group">
                    <p className="meta-label">{node.label}</p>
                    {editableFields.map((field) => (
                      <input
                        key={`${node.id}-${field.name}`}
                        className="input"
                        type={field.type || 'text'}
                        placeholder={field.placeholder}
                        value={nodeInputs[node.id]?.[field.name] || ''}
                        onChange={(e) => handleInputChange(node.id, field.name, e.target.value)}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          )}

          {/* Section C: Simulation Panel */}
          {workflow && (
            <div className={`card simulation-card ${simulation ? 'active' : ''}`}>
              <div className="sim-header">
                <h3>Execution Simulation</h3>
                {!simulation && (
                  <button className="btn btn-secondary btn-sm" onClick={handleSimulate} disabled={isSimulating}>
                    {isSimulating ? 'Simulating...' : <><Cpu size={14}/> Run Sim</>}
                  </button>
                )}
              </div>
              
              {simulation && (
                <div className="sim-results fade-in-up">
                  <div className={`sim-confidence ${simulation.confidence > 85 ? 'high' : 'warn'}`}>
                    <div className="conf-score">{simulation.confidence}%</div>
                    <div className="conf-label">Confidence Score</div>
                  </div>
                  
                  {simulation.confidence <= 85 && (
                    <div className="warning-banner">
                      <ShieldAlert size={16} /> Needs human review
                    </div>
                  )}

                  <div className="sim-risks">
                    <p className="meta-label">Identified Risks</p>
                    <div className="service-badges">
                      {getRiskBadges(simulation).map((risk) => (
                        <span key={risk} className="badge badge-warn">{risk}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section B: DAG Visualization */}
        <div className="card dag-card">
          {workflow ? (
             <div className="dag-container">
               <ReactFlow 
                 nodes={workflow.nodes} 
                 edges={workflow.edges}
                 fitView
                 className="custom-node-styles"
               >
                 <Background color="#ccc" gap={16} />
                 <Controls />
                 <MiniMap />
               </ReactFlow>
             </div>
          ) : (
            <div className="empty-dag">
              <Sparkles className="empty-icon" />
              <h3>No Workflow Generated</h3>
              <p>Type your intent on the left and generate a workflow.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const normalizeWorkflow = (response) => {
  const dag = response?.dag || { nodes: [], edges: [] };

  return {
    id: response.workflowId,
    dag,
    nodes: dag.nodes.map((node, index) => ({
      id: node.id,
      position: {
        x: 120 + index * 240,
        y: 180,
      },
      data: {
        label: node.label,
        service: node.service,
        action: node.action,
        inputs: node.inputs || {},
      },
      sourcePosition: 'right',
      targetPosition: 'left',
      style: {
        borderRadius: 14,
        padding: 12,
        border: '1px solid rgba(255,255,255,0.12)',
        background: '#0f172a',
        color: '#ffffff',
        width: 190,
      },
    })),
    edges: dag.edges.map((edge, index) => ({
      id: `e-${edge.from}-${edge.to}-${index}`,
      source: edge.from,
      target: edge.to,
      animated: true,
    })),
  };
};

const extractEditableInputs = (dag) => {
  return (dag?.nodes || []).reduce((acc, node) => {
    const editableFields = getEditableFields(node, dag);
    if (!editableFields.length) return acc;

    acc[node.id] = editableFields.reduce((fieldAcc, field) => {
      fieldAcc[field.name] = node.inputs?.[field.name] || '';
      return fieldAcc;
    }, {});
    return acc;
  }, {});
};

const getEditableFields = (node, dag) => {
  if (node.service === 'github' && node.action === 'listen_issue') {
    return [
      {
        name: 'repo',
        placeholder: 'GitHub repo (owner/repo)',
      },
    ];
  }

  if (node.service === 'github' && node.action === 'create_issue') {
    return [
      {
        name: 'repo',
        placeholder: 'GitHub repo (owner/repo)',
      },
      {
        name: 'title',
        placeholder: 'Issue title',
      },
      {
        name: 'body',
        placeholder: 'Issue body',
      },
    ];
  }

  if (node.service === 'github' && node.action === 'comment') {
    return [
      {
        name: 'repo',
        placeholder: 'GitHub repo (owner/repo)',
      },
      {
        name: 'issue_number',
        placeholder: 'Issue number',
        type: 'number',
      },
      {
        name: 'body',
        placeholder: 'Comment body',
      },
    ];
  }

  if (node.service === 'gmail' && node.action === 'send') {
    return [
      {
        name: 'to',
        placeholder: 'Receiver email address',
        type: 'email',
      },
      {
        name: 'subject',
        placeholder: 'Email subject',
      },
    ];
  }

  const hasUpstreamInput = hasIncomingEdge(node.id, dag);

  if (node.service === 'gemini' && node.action === 'summarize' && !hasUpstreamInput) {
    return [
      {
        name: 'text',
        placeholder: 'Text to summarize',
      },
    ];
  }

  if (node.service === 'gemini' && node.action === 'generate' && !hasUpstreamInput) {
    return [
      {
        name: 'prompt',
        placeholder: 'Prompt to generate from',
      },
    ];
  }

  if (node.service === 'gemini' && node.action === 'classify' && !hasUpstreamInput) {
    return [
      {
        name: 'text',
        placeholder: 'Text to classify',
      },
    ];
  }

  return [];
};

const hasEditableInputs = (dag) => (dag?.nodes || []).some((node) => getEditableFields(node, dag).length > 0);

const hasMissingRequiredInputs = (dag, nodeInputs) => {
  return (dag?.nodes || []).some((node) =>
    getEditableFields(node, dag).some((field) => !String(nodeInputs[node.id]?.[field.name] || '').trim())
  );
};

const hasIncomingEdge = (nodeId, dag) => {
  return (dag?.edges || []).some((edge) => edge.to === nodeId);
};

const getRiskBadges = (simulation) => {
  const risks = (simulation?.steps || [])
    .filter((step) => step.risk !== 'LOW' || step.hitlRequired)
    .map((step) => `${step.nodeId}: ${step.risk}${step.hitlRequired ? ' + HITL' : ''}`);

  return risks.length ? risks : ['No major risks detected'];
};

const inferServicesFromPrompt = (prompt, connectedServices) => {
  const lowered = prompt.toLowerCase();
  const serviceMatchers = {
    github: ['github', 'repo', 'repository', 'issue', 'pull request'],
    gmail: ['gmail', 'email', 'mail', 'inbox'],
    notion: ['notion', 'database', 'page', 'task', 'doc'],
    gemini: ['gemini', 'ai', 'summarize', 'summary', 'classify', 'generate'],
  };

  const matched = connectedServices.filter((service) =>
    (serviceMatchers[service] || []).some((keyword) => lowered.includes(keyword))
  );

  return matched;
};

export default WorkflowBuilder;
