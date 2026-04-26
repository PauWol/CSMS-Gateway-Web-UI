<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { Tour } from "flowbite-svelte";
  import WakeCycleCard from "./lib/components/WakeCycleCard.svelte";
  import ThreatScoreCard from "./lib/components/ThreatScoreCard.svelte";
  import SensorDataCard from "./lib/components/SensorDataCard.svelte";
  import ConfigUpdateCard from "./lib/components/ConfigUpdateCard.svelte";
  import { getStatus, getSensors, ping, uart_ping } from "./lib/api";
  import { type PageStatus, type Status, type Sensor, toConnectionStatus } from "./lib/types";
  import Toolbar from "./lib/components/Toolbar.svelte";
  import LoaderPage from "./lib/components/LoaderPage.svelte";
  import { tourSteps, handleTourComplete, handleTourSkip, hasCompletedTour } from "./lib/tour.js";

  let status: Status | null = {
  nextWake: 0,
  sleepInterval: 0,
  lastSync: 0,
  threatScore: 0,
};
  let sensors: Sensor[] = [];
  let lastSync = 0;
  let pingStatus: "ok" | "error" | "unconnected" = "ok";
  let pingInterval: ReturnType<typeof setInterval>;

  let page: PageStatus = {
    loading: true,
    state: "checking",
    errorMessage: "",
    error: null,
  };

  let tourActive = false;
  let currentStep = 0;

  function checkTour() {
    if (!hasCompletedTour()) tourActive = true;
  }

  async function loadData() {
  try {
    status = await getStatus();
    ({ lastSync, sensors } = await getSensors());
  } catch (err) {
    console.warn("[loadData] Failed to fetch data:", err);
    // non-fatal — show dashboard with stale/empty data
  } finally {
    page.loading = false;  // ← always unblock the loader
  }
}

  async function pollPing() {
  try {
    const res = await ping();
    pingStatus = toConnectionStatus(res.status);
    if (pingStatus === "ok") await loadData(); // ← refresh when node wakes
  } catch {
    pingStatus = "error";
  }
}

  async function checkConnection() {
    page.state = "checking";
    page.errorMessage = "";
    page.error = null;
    clearInterval(pingInterval);  // ← clear any existing poll before retrying

    //Stage 1: UART ping
    try {
      const uartRes = await uart_ping();
      if (uartRes.status !== "ok") {
        page.state = toConnectionStatus(uartRes.status);
        page.errorMessage =
          uartRes.status === "unconnected"
            ? "UART not connected — check wiring between Pi and ESP32"
            : "Serial port unavailable — is the port open?";
        return;
      }
    } catch {
      page.state = "error";
      page.errorMessage = "Could not reach UART interface";
      return;
    }

    // Stage 2: ESP ping 
    try {
      const res = await ping();
      pingStatus = toConnectionStatus(res.status);
      // don't block on unconnected — ESP32 may just be in a sleep cycle
    } catch {
      pingStatus = "error";
      // still continue to dashboard — the status banner will show the warning
    }
    page.loading = false;
    page.state = "ok";
    if (pingStatus !== "ok") {
      // if ESP32 isn't reachable, we can still show the dashboard with stale data
      console.warn("[checkConnection] ESP32 ping failed during connection check");
    } else {
      console.log("[checkConnection] Connection successful");
      await loadData();
    }

    checkTour();
    pingInterval = setInterval(pollPing, 30_000);
  }

  onMount(() => checkConnection());
  onDestroy(() => clearInterval(pingInterval));
</script>

{#if page.loading}
  <LoaderPage
    state={page.state}
    errorMessage={page.errorMessage}
    checkConnection={checkConnection}
  />
{:else}
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <Toolbar {pingStatus} />
    <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

      <!-- Dynamic status banner -->
      {#if pingStatus === "ok"}
        <div class="mb-6 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 dark:border-green-800 dark:bg-green-950/40">
          <span class="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
          <span class="text-sm font-medium text-green-700 dark:text-green-400">System Online</span>
        </div>
      {:else if pingStatus === "unconnected"}
        <div class="mb-6 flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-2.5 dark:border-yellow-800 dark:bg-yellow-950/40">
          <span class="h-2 w-2 animate-pulse rounded-full bg-yellow-400"></span>
          <span class="text-sm font-medium text-yellow-700 dark:text-yellow-400">
            Security node is sleeping — will reconnect automatically
          </span>
        </div>
      {:else}
        <div class="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 dark:border-red-800 dark:bg-red-950/40">
          <span class="h-2 w-2 rounded-full bg-red-500"></span>
          <span class="text-sm font-medium text-red-700 dark:text-red-400">Security node unreachable</span>
          <button onclick={pollPing} class="ml-auto text-xs text-red-500 underline hover:text-red-700">Retry</button>
        </div>
      {/if}

      <!-- Primary grid -->
      <div class="grid gap-4 sm:gap-6 md:grid-cols-2">
        <ThreatScoreCard {status} />
        <WakeCycleCard {status} />
        <div class="md:col-span-2">
          <SensorDataCard lastSync={lastSync} {sensors} />
        </div>
        <div class="md:col-span-2">
          <ConfigUpdateCard />
        </div>
      </div>

      <footer class="mt-8 text-center text-xs text-gray-400 dark:text-gray-600">
        CSMS &middot; Coop Security & Monitoring System
      </footer>
    </main>
  </div>
{/if}

<Tour
  bind:active={tourActive}
  bind:currentStep={currentStep}
  steps={tourSteps}
  oncomplete={handleTourComplete}
  onskip={handleTourSkip}
/>