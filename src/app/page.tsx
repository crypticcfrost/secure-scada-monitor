"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function HomePage() {
  const [connecting, setConnecting] = useState(false);
  const router = useRouter();

  const handleConnect = () => {
    setConnecting(true);
    setTimeout(() => {
      router.push("/topology/demo");
    }, 4000);
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <svg
          className="w-full h-full opacity-10"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 800 800"
        >
          <circle cx="400" cy="400" r="200" stroke="cyan" fill="none" />
          <circle cx="400" cy="400" r="300" stroke="magenta" fill="none" />
          <line x1="100" y1="100" x2="700" y2="700" stroke="lightblue" />
          <line x1="700" y1="100" x2="100" y2="700" stroke="lightblue" />
        </svg>
      </div>

      <AnimatePresence>
        {!connecting ? (
          <motion.div
            className="relative z-10 flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            {/* Header */}
            <header className="text-center mb-10">
              <h1 className="text-5xl font-bold mb-2">SCADA Network Topology Manager</h1>
              <p className="text-lg text-gray-300">
                Monitor and secure your SCADA network in real-time.
              </p>
            </header>

            {/* Card */}
            <motion.div
              className="p-6 bg-gray-800 border border-gray-700 rounded-lg shadow-lg flex flex-col items-center justify-center text-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <h2 className="text-2xl font-bold mb-4">Connect to SCADA Network</h2>
              <p className="text-gray-400 mb-6">
                Securely connect to your SCADA network and start monitoring.
              </p>
              <button
                onClick={handleConnect}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded"
              >
                Connect
              </button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            className="relative z-10 flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <h1 className="text-3xl font-bold mb-6">Connecting to SCADA Network...</h1>
            <div className="w-3/4 max-w-lg bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="mb-4 text-sm text-gray-400">
                <p>Establishing secure connection...</p>
                <p>IP Address: 192.168.1.{Math.floor(Math.random() * 100)}</p>
                <p>Authenticating...</p>
              </div>
              <div className="w-full bg-gray-700 h-4 rounded">
                <motion.div
                  className="h-4 bg-green-600 rounded"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3.5 }}
                ></motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}