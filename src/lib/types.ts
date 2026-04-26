export type ConnectionStatus = "ok" | "error" | "unconnected";
export const POLL_INTERVAL = 30_000;

export type Status = {
  nextWake: number;
  sleepInterval: number;
  lastSync: number;
  threatScore: number;
};

export type Sensor = {
  name: string;
  value: string;
  timestamp: number;
};

export type PageStatus = {
  loading: boolean;
  error: string | null;
  uart_gateway: "ok" | "error" | "unconnected" | null;
  errorMessage: string;
  tourActive: boolean;
  currentStep: number;
};

export type NodeState = {
  sensors: Sensor[];
  nextWake: number;
  sleepInterval: number;
  lastSync: number;
  threatScore: number;
  pingStatus: "idle" | "ok" | "error" | "unconnected"; // "idle" = no poll has run yet
  pingTime: Date;           // last time node responded with "ok"
  lastPingAttempt: Date | null; // last time a poll was attempted (regardless of result)
};

export type PingResponse = {
  status: ConnectionStatus;
};

export function toConnectionStatus(s: string): ConnectionStatus {
  if (s === "ok" || s === "error" || s === "unconnected") return s;
  return "error"; // unknown value → treat as error
}