
export type ConnectionStatus = "ok" | "error" | "unconnected";


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
  state: "checking" | "ok" | "error"| "unconnected";
  errorMessage: string;
}

export type PingResponse = {
  status: ConnectionStatus;
};

export function toConnectionStatus(s: string): ConnectionStatus {
  if (s === "ok" || s === "error" || s === "unconnected") return s;
  return "error"; // unknown value → treat as error
}