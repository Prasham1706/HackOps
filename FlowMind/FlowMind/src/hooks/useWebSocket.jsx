import { useEffect, useMemo, useState } from 'react';

const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

export const useWebSocket = (workflowId) => {
  const [logs, setLogs] = useState([]);
  const [nodeStates, setNodeStates] = useState({});
  const [status, setStatus] = useState('idle');
  const [approvalState, setApprovalState] = useState(null);

  const socketUrl = useMemo(() => {
    if (!workflowId) return null;
    return `${WS_BASE_URL.replace(/\/$/, '')}/ws/workflow/${workflowId}`;
  }, [workflowId]);

  useEffect(() => {
    if (!socketUrl) return;

    const ws = new WebSocket(socketUrl);
    setStatus('running');

    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      const nodeId = payload.nodeId;

      if (payload.type === 'runtime_block') {
        setStatus('approval_needed');
        setApprovalState({ nodeId, reason: payload.reason });
      }

      if (payload.type === 'workflow_complete') {
        setStatus('completed');
        setApprovalState(null);
      }

      if (payload.type === 'step_failed') {
        setStatus('failed');
      }

      if (nodeId) {
        setNodeStates((prev) => ({ ...prev, [nodeId]: payload.type }));
      }

      const logEntry = mapEventToLog(payload);
      if (logEntry) {
        setLogs((prev) => [...prev, logEntry]);
      }
    };

    ws.onerror = () => {
      setStatus('failed');
      setLogs((prev) => [...prev, {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        type: 'step_failed',
        message: 'WebSocket connection failed. Check the backend server and VITE_WS_URL.',
      }]);
    };

    return () => {
      ws.close();
    };
  }, [socketUrl]);

  return { logs, nodeStates, status, approvalState };
};

const mapEventToLog = (payload) => {
  const timestamp = new Date().toLocaleTimeString();

  const messageMap = {
    step_started: `Started ${payload.nodeId}`,
    step_success: payload.output ? `${payload.nodeId} succeeded` : `${payload.nodeId} completed`,
    step_failed: payload.error ? `${payload.nodeId} failed: ${payload.error}` : `${payload.nodeId} failed`,
    self_healing: `${payload.nodeId} retrying with ${payload.strategy || 'self-healing'}`,
    runtime_block: `${payload.nodeId} blocked: ${payload.reason}`,
    parallel_cleared: `Parallel group cleared: ${(payload.group || []).join(', ')}`,
    workflow_complete: 'Workflow execution finished successfully',
  };

  if (!messageMap[payload.type]) {
    return null;
  }

  return {
    id: Date.now() + Math.random(),
    timestamp,
    type: payload.type,
    message: messageMap[payload.type],
  };
};
