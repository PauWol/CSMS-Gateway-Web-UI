import type { Status, Sensor, PingResponse } from "./types";

// Use the current hostname/IP from the browser's location
const API_BASE = `${window.location.protocol}//${window.location.hostname}:${window.location.port || (window.location.protocol === 'https:' ? 443 : 8000)}/api/`

const API_ENDPOINTS = {
  status: `${API_BASE}/status`,
  sensors: `${API_BASE}/sensors`,
  ping: `${API_BASE}/ping`
};



// TODO: Uncomment this section to use real API calls instead of mock data

export async function getStatus(): Promise<Status> {
  const response = await fetch(API_ENDPOINTS.status);
  if (!response.ok) {
    throw new Error("Failed to fetch status");
  }
  return response.json();
}

export async function getSensors(): Promise<{ lastSync: number; sensors: Sensor[] }> {
  const response = await fetch(API_ENDPOINTS.sensors);
  if (!response.ok) {
    throw new Error("Failed to fetch sensors");
  }
  let lastSync = Date.now();

  return { lastSync, sensors: await response.json() };
}

export async function ping(): Promise<PingResponse> {
  const response = await fetch(API_ENDPOINTS.ping);
  if (!response.ok) {
    throw new Error("Ping failed");
  }
  return response.json();
}


/*
// -------------------------
// Mock Internal State
// -------------------------

let config = {
  sleepInterval: 60000 // 60 seconds
};

let lastSync = Date.now();

let sensors = [
  {
    name: "Door Sensor",
    value: "Closed",
    timestamp: Date.now()
  },
  {
    name: "Motion Sensor",
    value: "No Motion",
    timestamp: Date.now()
  },
  {
    name: "Temperature",
    value: "21.4 °C",
    timestamp: Date.now()
  }
];

let threatScore = 12; // 0 - 100


// -------------------------
// Utility
// -------------------------

function simulateDelay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomizeThreatScore() {
  const variation = Math.floor(Math.random() * 10 - 5);
  threatScore = Math.max(0, Math.min(100, threatScore + variation));
}


// -------------------------
// API FUNCTIONS
// -------------------------

export async function getStatus() {
  await simulateDelay();

  randomizeThreatScore();

  const now = Date.now();
  const nextWake = lastSync + config.sleepInterval;

  return {
    nextWake,
    sleepInterval: config.sleepInterval,
    lastSync,
    threatScore
  };
}


export async function getSensors() {
  await simulateDelay();

  // Simulate sensor refresh
  lastSync = Date.now();

  sensors = sensors.map((sensor) => ({
    ...sensor,
    timestamp: Date.now()
  }));

  // Random motion trigger example
  if (Math.random() > 0.8) {
    sensors[1].value = "Motion Detected";
    threatScore = Math.min(100, threatScore + 20);
  } else {
    sensors[1].value = "No Motion";
  }

  return sensors;
}

export async function ping() {
  // simulate network delay
  await new Promise((r) => setTimeout(r, 800));

  // simulate occasional failure (10%)
  if (Math.random() < 0.5) {
    throw new Error("Gateway not reachable");
  }

  return { status: "ok" };
}

*/