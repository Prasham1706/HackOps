import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';
import { ArrowLeft, CheckCircle, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';
import './ExecutionView.css';

const ExecutionView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { execId, workflow } = location.state || {};

  const { logs, nodeStates, status, approvalState } = useWebSocket(workflow?.id);

  // Apply real-time styles to nodes based on WebSocket events
  const liveNodes = workflow?.nodes.map(node => {
    const nodeStatus = nodeStates[node.id];
    let className = `base-node node-${node.data.service}`;
    if (nodeStatus === 'step_started') className += ' live-pulse';
    if (nodeStatus === 'step_success') className += ' live-success';
    if (nodeStatus === 'step_failed') className += ' live-failed';
    if (nodeStatus === 'runtime_block') className += ' live-warning';

    return { ...node, className };
  }) || [];

  const handleApprove = () => {
    alert('Live approval resume is not implemented in the backend yet. The workflow log will show the real blocked reason.');
  };

  const handleReject = () => {
    alert('The workflow has already been paused or failed on the backend. Please return to Workflow Builder and run it again after fixing the input/config.');
  };

  if (!workflow) {
    return <div className="p-4">No execution context. <button onClick={() => navigate('/builder')}>Go back</button></div>;
  }

  return (
    <div className="execution-page fade-in-up">
      <div className="page-header">
        <div>
          <button className="btn btn-icon back-btn" onClick={() => navigate('/builder')}>
            <ArrowLeft size={16} />
          </button>
          <div className="d-inline-block ml-3">
             <h1 className="page-title">Live Execution</h1>
             <p className="page-subtitle">ID: {execId}</p>
          </div>
        </div>
        <div>
          <span className={`badge uppercase badge-${status === 'running' ? 'accent' : status === 'completed' ? 'success' : status === 'approval_needed' ? 'warn' : 'danger'}`}>
            {status}
          </span>
        </div>
      </div>

      <div className="execution-layout">
        {/* Left: DAG */}
        <div className="card dag-card">
          <ReactFlow 
            nodes={liveNodes} 
            edges={workflow.edges}
            fitView
            className="real-time-flow"
          >
            <Background color="#ccc" gap={16} />
            <Controls />
          </ReactFlow>
        </div>

        {/* Right: Logs & HITL */}
        <div className="execution-sidebar">
          {/* HITL Modal / Panel */}
          {approvalState && (
            <div className="card hitl-card fade-in-up">
              <div className="hitl-header">
                <ShieldAlert className="text-warn" size={24} />
                <h3>Manual Review Needed</h3>
              </div>
              <p>{approvalState.reason || `Execution paused at "${approvalState.nodeId}". Review the workflow inputs before retrying.`}</p>
              <div className="hitl-actions">
                <button className="btn btn-secondary w-100" onClick={handleReject}>Reject</button>
                <button className="btn btn-primary w-100" onClick={handleApprove}>Approve & Continue</button>
              </div>
            </div>
          )}

          {/* Logs */}
          <div className="card console-card">
            <h3 className="console-title">Execution Logs</h3>
            <div className="console-logs">
              {logs.map((log) => (
                <div key={log.id} className={`log-entry ${log.type}`}>
                  <span className="log-time">[{log.timestamp}]</span>
                  <div className="log-content">
                    {log.type === 'step_success' && <CheckCircle size={14} className="text-success" />}
                    {log.type === 'step_failed' && <AlertTriangle size={14} className="text-danger" />}
                    {log.type === 'self_healing' && <span className="badge badge-warn sm-badge">Fixing...</span>}
                    <span className="log-msg">{log.message}</span>
                  </div>
                </div>
              ))}
              <div className="scroll-anchor"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutionView;
