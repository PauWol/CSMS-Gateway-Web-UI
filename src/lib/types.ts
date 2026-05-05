export type ConnectionStatus = "ok" | "error" | "unconnected";
export const POLL_INTERVAL = 30_000;

export type Status = {
  sleepInterval: number;
  lastSync: number;
  threatScore: number;
  threshold: number;
  phase: "DAY" | "DUSK" | "NIGHT" | "UNKNOWN";
  volt: number;
  tte_s: number;
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
  sensors: Sensor[];  nextWake: number;  sleepInterval: number;
  lastSync: number;
  threatScore: number;
  threshold: number;
  phase: "DAY" | "DUSK" | "NIGHT" | "UNKNOWN";
  volt: number;
  tte_s: number;
  pingStatus: "idle" | "ok" | "error" | "unconnected";
  pingTime: Date;
  lastPingAttempt: Date | null;
};

export type PingResponse = {
  status: ConnectionStatus;
};

export function toConnectionStatus(s: string): ConnectionStatus {
  if (s === "ok" || s === "error" || s === "unconnected") return s;
  return "error"; // unknown value → treat as error
}