import { useEffect, useMemo, useRef, useState } from 'react';

const getWsBaseUrl = () => {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL.replace(/\/$/, '');
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.hostname}:8000`;
};

const MAX_RETRIES = 5;
const BASE_RETRY_DELAY_MS = 1000;

export const useWebSocket = (workflowId) => {
  const [logs, setLogs] = useState([]);
  const [nodeStates, setNodeStates] = useState({});
  const [status, setStatus] = useState('idle');
  const [approvalState, setApprovalState] = useState(null);
  const [replannedDag, setReplannedDag] = useState(null);

  const wsRef = useRef(null);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef(null);
  const isFinalRef = useRef(false); // true once workflow completes/fails

  const socketUrl = useMemo(() => {
    if (!workflowId) return null;
    return `${getWsBaseUrl()}/ws/workflow/${workflowId}`;
  }, [workflowId]);

  useEffect(() => {
    if (!socketUrl) return;

    isFinalRef.current = false;
    retryCountRef.current = 0;

    const connect = (delayMs = 0) => {
      retryTimerRef.current = setTimeout(() => {
        if (isFinalRef.current) return;

        const ws = new WebSocket(socketUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          retryCountRef.current = 0; // reset on successful connect
        };

        ws.onmessage = (event) => {
          let payload;
          try {
            payload = JSON.parse(event.data);
          } catch {
            return;
          }

          const nodeId = payload.nodeId;

          if (payload.type === 'runtime_block') {
            setStatus('approval_needed');
            setApprovalState({ nodeId, reason: payload.reason });
          }

          if (payload.type === 'workflow_complete') {
            isFinalRef.current = true;
            setStatus('completed');
            setApprovalState(null);
          }

          if (payload.type === 'workflow_failed') {
            isFinalRef.current = true;
            setStatus('failed');
            setApprovalState(null);
          }

          if (payload.type === 'workflow_repairing' || payload.type === 'workflow_replanned') {
            setStatus('running');
            setApprovalState(null);
          }

          if (payload.type === 'workflow_replanned' && payload.dag) {
            setReplannedDag(payload.dag);
            setNodeStates({});
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
          // onerror always fires before onclose — let onclose handle retry
        };

        ws.onclose = () => {
          // Don't retry if workflow already finished or we closed it ourselves
          if (isFinalRef.current) return;

          const retry = retryCountRef.current < MAX_RETRIES;
          if (retry) {
            retryCountRef.current += 1;
            const delay = BASE_RETRY_DELAY_MS * Math.pow(2, retryCountRef.current - 1);
            setLogs((prev) => [
              ...prev,
              {
                id: Date.now() + Math.random(),
                timestamp: new Date().toLocaleTimeString(),
                type: 'self_healing',
                message: `WebSocket reconnecting (attempt ${retryCountRef.current}/${MAX_RETRIES})...`,
              },
            ]);
            connect(delay);
          } else {
            setStatus('failed');
            setLogs((prev) => [
              ...prev,
              {
                id: Date.now() + Math.random(),
                timestamp: new Date().toLocaleTimeString(),
                type: 'step_failed',
                message: `Could not connect to backend at ${socketUrl}. Make sure the backend is running on port 8000.`,
              },
            ]);
          }
        };
      }, delayMs);
    };

    // 400ms startup delay — gives the backend time to register the WS route
    // before execution events start firing from the background task
    setStatus('running');
    connect(400);

    return () => {
      isFinalRef.current = true;
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [socketUrl]);

  return { logs, nodeStates, status, approvalState, replannedDag };
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
    workflow_repairing: payload.reason
      ? `Replanning workflow after ${payload.failedNodeId} failed: ${payload.reason}`
      : `Replanning workflow after ${payload.failedNodeId} failed`,
    workflow_replanned: `Workflow DAG regenerated successfully (attempt ${payload.attempt})`,
    workflow_repair_failed: payload.reason
      ? `Workflow replanning failed: ${payload.reason}`
      : 'Workflow replanning failed',
    workflow_complete: 'Workflow execution finished successfully',
    workflow_failed: 'Workflow execution failed',
  };

  if (!messageMap[payload.type]) {
    return null;
  }

  return {
    id: Date.now() + Math.random(),
    timestamp,
    type: payload.type,
    message: messageMap[payload.type],
    output: payload.output,
  };
};
