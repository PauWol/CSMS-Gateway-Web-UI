import type { TourStep } from "flowbite-svelte";

export const tourSteps: TourStep[] = [
  {
    target: "#toolbar-logo",
    title: "Welcome to CSMS",
    description: "Your Coop Security & Monitoring System. Let's walk through the key features.",
    placement: "bottom"
  },
  {
    target: "#log-request-button",
    title: "Request Logs",
    description: "Fetch recent activity logs from the Security-Node — they'll download automatically.",
    placement: "left"
  },
  {
    target: "#dark-mode-button",
    title: "Dark Mode",
    description: "Switch between light and dark themes.",
    placement: "bottom"
  },
  {
    target: "#threat-score-card",
    title: "Threat Score",
    description: "Live intruder likelihood score for the monitored area. Updates each wake cycle.",
    placement: "left"
  },
  {
    target: "#wake-cycle-card",
    title: "Wake Cycle",
    description: "Countdown to the next Security-Node check-in.",
    placement: "top"
  },
  {
    target: "#sensor-data-card",
    title: "Sensor Data",
    description: "Real-time readings from all active sensors in the coop.",
    placement: "right"
  }
];

export function setLocalStorageTourCompleted() {
  localStorage.setItem("tourCompleted", "true");
}

export function hasCompletedTour() {
  return localStorage.getItem("tourCompleted") === "true";
}

export function handleTourComplete() {
  setLocalStorageTourCompleted();
}

export function handleTourSkip() {
  setLocalStorageTourCompleted();
}