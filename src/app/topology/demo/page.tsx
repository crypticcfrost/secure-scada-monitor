"use client";

import React, { useState, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";

const initialNodes = [
    {
      id: "1",
      type: "input",
      data: { label: "Router A (Layer 3)" },
      position: { x: 250, y: 50 },
      className: "node-router",
    },
    {
      id: "2",
      data: { label: "Switch 1 (Layer 2)" },
      position: { x: 150, y: 200 },
      className: "node-switch",
    },
    {
      id: "3",
      data: { label: "Switch 2 (Layer 2)" },
      position: { x: 350, y: 200 },
      className: "node-switch",
    },
    {
      id: "4",
      data: { label: `SCADA Endpoint 1\nLat ${Math.random().toFixed(4)}, Long ${Math.random().toFixed(4)}` },
      position: { x: 100, y: 350 },
      className: "node-endpoint",
    },
    {
      id: "5",
      data: { label: `SCADA Endpoint 2\nLat ${Math.random().toFixed(4)}, Long ${Math.random().toFixed(4)}` },
      position: { x: 400, y: 350 },
      className: "node-endpoint",
    },
  ];  

const initialEdges = [
  { id: "e1-2", source: "1", target: "2", label: "EIGRP Link" },
  { id: "e1-3", source: "1", target: "3", label: "EIGRP Link" },
  { id: "e2-4", source: "2", target: "4", label: "Ethernet" },
  { id: "e3-5", source: "3", target: "5", label: "Ethernet" },
];

export default function AdminTopology() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [flashingEdges, setFlashingEdges] = useState<string[]>([]);
  const [pipelineFrozen, setPipelineFrozen] = useState(false);
  const [nodeId, setNodeId] = useState(nodes.length + 1);
  const [isRunning, setIsRunning] = useState(false);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      window.location.href = "/";
    }, 2000);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setNetworkStats({
        latency: `${Math.floor(Math.random() * 50) + 10}ms`,
        bandwidth: `${Math.floor(Math.random() * 50) + 50}Mbps`,
        uptime: `${(99.9 + Math.random() * 0.1).toFixed(2)}%`,
      });
    }, 5000);
  
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isRunning && !pipelineFrozen) {
      const interval = setInterval(() => {
        const randomEvent = Math.random();
        if (randomEvent < 0.2) addDevice();
        else if (randomEvent < 0.6) simulateDataFlow();
        else if (randomEvent < 0.8) removeDevice();
        else addUnauthorizedDevice();
      }, 5000);
  
      return () => clearInterval(interval);
    }
  }, [isRunning, pipelineFrozen, nodes, edges]);  
  
  // Admin Stats Mock Data
  const [networkStats, setNetworkStats] = useState({
    latency: "25ms",
    bandwidth: "100Mbps",
    uptime: "99.98%",
  });

  const getEdgeStyle = (edgeId: string) => {
    return flashingEdges.includes(edgeId) ? { stroke: "red", strokeWidth: 3, animation: "red-pulse 1s infinite" } : {};
  };  

  const addDevice = () => {
    const location = `Lat ${Math.random().toFixed(4)}, Long ${Math.random().toFixed(4)}`;
    const newNode = {
      id: `${nodeId}`,
      data: { label: `SCADA Endpoint ${nodeId}\n${location}`, location },
      position: { x: Math.random() * 500 + 50, y: Math.random() * 300 + 150 },
      className: "node-endpoint",
    };
  
    const availableSwitch = nodes.find(
      (node) => node.className === "node-switch" && !edges.some((edge) => edge.source === node.id)
    );
  
    if (availableSwitch) {
      const newEdge = {
        id: `e${availableSwitch.id}-${nodeId}`,
        source: availableSwitch.id,
        target: newNode.id,
        label: "Ethernet",
      };
      setEdges((eds) => [...eds, newEdge]);
    } else {
      const router = nodes.find((node) => node.className === "node-router");
      if (router) {
        const newEdge = {
          id: `e${router.id}-${nodeId}`,
          source: router.id,
          target: newNode.id,
          label: "Dynamic Link",
        };
        setEdges((eds) => [...eds, newEdge]);
      }
    }
  
    setNodes((nds) => [...nds, newNode]);
    const logMessage = `SCADA Endpoint ${nodeId} added at ${location}`;
    toast.success(logMessage);
    setNodeId((prev) => prev + 1);
  };  

  const removeDevice = () => {
    const removableNodes = nodes.filter((node) => node.className === "node-endpoint");
    if (removableNodes.length <= 1) {
      return;
    }
  
    const randomNode = removableNodes[Math.floor(Math.random() * removableNodes.length)];
    setNodes((nds) => nds.filter((node) => node.id !== randomNode.id));
    setEdges((eds) => eds.filter((edge) => edge.source !== randomNode.id && edge.target !== randomNode.id));
  
    const logMessage = `SCADA Endpoint ${randomNode.data.label} removed.`;
    toast.error(logMessage);
  };  

  const [flashingNodes, setFlashingNodes] = useState<string[]>([]);

  const addUnauthorizedDevice = () => {
    const newNode = {
      id: `${nodeId}`,
      data: { label: `Unauthorized Device ${nodeId}` },
      position: { x: Math.random() * 500 + 50, y: Math.random() * 300 + 150 },
      className: "node-unauthorized",
    };
  
    setNodes((nds) => [...nds, newNode]);
    setAlerts((alerts) => [...alerts, `Unauthorized device detected: ${newNode.data.label}`]);
    setFlashingNodes((fn) => [...fn, newNode.id]);
  
    toast.warning(`Security Alert: Unauthorized Device ${nodeId}`);
    setNodeId((prev) => prev + 1);
    setNetworkLogs((logs) => [
        ...logs,
        `${new Date().toLocaleTimeString()}: Unauthorized device detected at ${newNode.data.label}`,
      ]);      
  };  
  
  // Apply flashing style conditionally
  const getNodeClassName = (node: any) => {
    if (flashingNodes.includes(node.id)) {
      return node.className === "node-unauthorized" ? "node-unauthorized-flash" : "node-failure-flash";
    }
    return node.className;
  };  

  const handleAlertAction = (alertIndex: number) => {
    const alertMessage = alerts[alertIndex];
    if (alertMessage.includes("data transfer failure")) {
      const edgeId = flashingEdges[0];
      const nodeIds = flashingNodes;
      handleFailureResolve(edgeId, nodeIds);
    } else {
      const unauthorizedNode = nodes.find(
        (node) => node.className === "node-unauthorized"
      );
      if (unauthorizedNode) {
        setNodes((nds) =>
          nds.filter((node) => node.id !== unauthorizedNode.id)
        );
        setEdges((eds) =>
          eds.filter(
            (edge) =>
              edge.source !== unauthorizedNode.id &&
              edge.target !== unauthorizedNode.id
          )
        );
      }
    }
  
    setAlerts((alerts) => alerts.filter((_, index) => index !== alertIndex));
    toast.success("Action taken successfully!");
  };  

  const handleFailureResolve = (edgeId: string, nodeIds: string[]) => {
    setFlashingEdges((fe) => fe.filter((id) => id !== edgeId));
    setFlashingNodes((fn) => fn.filter((id) => !nodeIds.includes(id)));
    setAlerts((currentAlerts) => currentAlerts.filter((alert) => !alert.includes("Data transfer failed")));
    setPipelineFrozen(false);
    toast.success("Failure resolved!");
    setNetworkLogs((logs) => [
        ...logs,
        `${new Date().toLocaleTimeString()}: Data failure resolved. Pipeline restored.`,
    ]);      
  };   

  const [networkLogs, setNetworkLogs] = useState<string[]>([]);

    // Add a function to log unexpected network changes
  const logUnexpectedChange = () => {
  const changeTypes = [
      "Unexpected latency increase",
      "Unauthorized device attempting access",
      "Switch reboot detected",
      "New route discovered",
  ];
  const randomChange = changeTypes[Math.floor(Math.random() * changeTypes.length)];
  setNetworkLogs((logs) => [...logs, `${new Date().toLocaleTimeString()}: ${randomChange}`]);
  toast.warning(`Network Change: ${randomChange}`);
  };

  const simulateDataFlow = () => {
    const randomEdge = edges[Math.floor(Math.random() * edges.length)];
    if (randomEdge) {
      // Update the edge to show as animated and orange
      const updatedEdges = edges.map((edge) =>
        edge.id === randomEdge.id
          ? {
              ...edge,
              animated: true,
              style: {
                stroke: "orange", // Set the color to orange
                strokeDasharray: "5,5", // Create a dotted effect
                strokeWidth: 3, // Thicker edge for visibility
              },
            }
          : edge
      );
      setEdges(updatedEdges);
      toast.info(`Data flowing from ${randomEdge.source} to ${randomEdge.target}`);
  
      // Reset the edge after the flow duration
      setTimeout(() => {
        const resetEdges = updatedEdges.map((edge) =>
          edge.id === randomEdge.id
            ? {
                ...edge,
                animated: false,
                style: {
                  stroke: "black", // Reset to default color
                  strokeDasharray: "0", // Remove the dotted effect
                  strokeWidth: 1, // Reset to default width
                },
              }
            : edge
        );
        setEdges(resetEdges);
      }, 5000); // 5-second duration for data flow
    }
  };

  const simulateDataFailure = () => {
    const randomEdge = edges[Math.floor(Math.random() * edges.length)];
    if (randomEdge) {
      const sourceNode = nodes.find((node) => node.id === randomEdge.source);
      const targetNode = nodes.find((node) => node.id === randomEdge.target);
  
      if (sourceNode && targetNode) {
        const logMessage = `Data transfer failed from ${sourceNode.data.label} to ${targetNode.data.label}`;
        setNetworkLogs((logs) => [
          ...logs,
          `${new Date().toLocaleTimeString()}: ${logMessage}`,
        ]);
  
        // Add flashing states for nodes and edges
        setFlashingNodes((fn) => [...fn, sourceNode.id, targetNode.id]);
        setFlashingEdges((fe) => [...fe, randomEdge.id]);
        setPipelineFrozen(true); // Freeze the pipeline
  
        setAlerts((alerts) => [
          ...alerts,
          `Pipeline is frozen due to data transfer failure. Take Action to continue.`,
        ]);
        toast.error(logMessage);
      }
    }
  };

  const toggleSimulation = () => {
    setIsRunning(!isRunning);
    toast.info(isRunning ? "Monitoring Stopped" : "Monitoring Started");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <AnimatePresence>
      {isLoggingOut && (
          <motion.div
            className="absolute inset-0 bg-gray-800 flex items-center justify-center z-50"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="text-center"
            >
              <h1 className="text-4xl font-bold text-red-500">Logging Out...</h1>
              <p className="text-gray-300 mt-4">Thank you for using the system. Redirecting to home page.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="w-full py-4 bg-gray-800 shadow">
        <h1 className="text-3xl font-bold text-center">SCADA Network Administration</h1>
        <div className="text-sm text-gray-400 mt-2 text-center">
          Latency: {networkStats.latency} | Bandwidth: {networkStats.bandwidth} | Uptime: {networkStats.uptime}
        </div>
      </header>

      <motion.div
        className="flex flex-col w-full h-full p-4 bg-gray-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="w-full h-[600px] bg-gray-900 rounded">
        <ReactFlow
            nodes={nodes.map((node) => ({ ...node, className: getNodeClassName(node) }))}
            edges={edges.map((edge) => ({
                ...edge,
                style: getEdgeStyle(edge.id),
            }))}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            style={{ width: "100%", height: "100%" }}
            >
            <Background color="#444" gap={16} />
            <Controls />
        </ReactFlow>
        </div>
        {alerts.length > 0 && (
          <motion.div
            className="mt-4 bg-red-500 text-white p-4 rounded"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          >
            <h2 className="font-bold">Security Alerts</h2>
            <ul>
              {alerts.map((alert, index) => (
                <li key={index} className="flex justify-between items-center">
                  {alert}
                  <button
                    onClick={() => handleAlertAction(index)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-2 ml-2 rounded"
                  >
                    Take Action
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
        {networkLogs.length > 0 && (
            <motion.div
                className="mt-4 bg-gray-700 text-white p-4 rounded max-h-40 overflow-y-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <h2 className="font-bold mb-2">Network Logs</h2>
                <ul className="text-sm">
                {networkLogs.map((log, index) => (
                    <li key={index} className="mb-1">
                    {log}
                    </li>
                ))}
                </ul>
            </motion.div>
        )}
        <motion.div
          className="mt-6 bg-gray-700 text-white p-4 rounded flex flex-wrap justify-between gap-4"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <button
            onClick={toggleSimulation}
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
          >
            {isRunning ? "Stop Monitoring" : "Start Monitoring"}
          </button>
          <button
            onClick={addDevice}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Add SCADA Endpoint
          </button>
          <button
            onClick={removeDevice}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Remove SCADA Endpoint
          </button>
          <button
            onClick={simulateDataFlow}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Simulate Data Flow
          </button>
          <button
            onClick={addUnauthorizedDevice}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          >
            Simulate Unauthorized Device
          </button>
          <button
            onClick={simulateDataFailure}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded"
          >
            Simulate Data Failure
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
        </motion.div>
      </motion.div>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
}