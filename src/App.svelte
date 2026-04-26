<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { Tour } from "flowbite-svelte";
  import WakeCycleCard from "./lib/components/WakeCycleCard.svelte";
  import ThreatScoreCard from "./lib/components/ThreatScoreCard.svelte";
  import SensorDataCard from "./lib/components/SensorDataCard.svelte";
  import ConfigUpdateCard from "./lib/components/ConfigUpdateCard.svelte";
  import { getStatus, getSensors, ping, uart_ping } from "./lib/api";
  import { type PageStatus, toConnectionStatus, type NodeState, POLL_INTERVAL } from "./lib/types";
  import Toolbar from "./lib/components/Toolbar.svelte";
  import LoaderPage from "./lib/components/LoaderPage.svelte";
  import { tourSteps, handleTourComplete, handleTourSkip, hasCompletedTour } from "./lib/tour.js";

  let security_node: NodeState = {
    sensors: [],
    nextWake: 0,
    sleepInterval: 0,
    lastSync: 0,
    threatScore: 0,
    pingStatus: "idle",       // no poll has run yet
    pingTime: new Date(0),
    lastPingAttempt: null,
  };

  let pingInterval: ReturnType<typeof setInterval>;

  let page: PageStatus = {
    loading: true,
    error: null,
    uart_gateway: null,
    errorMessage: "",
    tourActive: false,
    currentStep: 0,
  };

  function checkTour() {
    if (!hasCompletedTour()) page.tourActive = true;
  }

  // Checks the UART bridge. On success, starts the node polling loop.
  async function checkUART() {
    page.uart_gateway = null; // reset to "checking" while retrying
    try {
      const res = await uart_ping();
      page.uart_gateway = toConnectionStatus(res.status);
    } catch (err: any) {
      page.uart_gateway = "error";
      page.errorMessage = err?.message ?? "UART check failed";
      return;
    }

    if (page.uart_gateway === "ok") {
      // Start polling immediately so the dashboard isn't blank for 30 s
      clearInterval(pingInterval);
      pollPing();
      pingInterval = setInterval(pollPing, POLL_INTERVAL);
    }
  }

  async function reqSensors() {
    const res = await getSensors();
    // Full reassignment — property mutation inside async callbacks
    // is unreliable in Svelte 4; this guarantees reactivity fires
    security_node = { ...security_node, sensors: res.sensors, lastSync: res.lastSync };
  }

  async function reqStatus() {
    const res = await getStatus();
    security_node = { ...security_node, threatScore: res.threatScore };
  }

  async function pollPing() {
    // Stamp attempt time before anything can fail
    security_node = { ...security_node, lastPingAttempt: new Date() };
    page.errorMessage = "";

    // --- Stage 1: ping the remote node ---
    let pingRes;
    try {
      pingRes = await ping();
    } catch (err: any) {
      // HTTP-level failure — fetch itself threw (network error, server down, etc.)
      security_node = { ...security_node, pingStatus: "error" };
      page.errorMessage = err?.message ?? "Ping request failed";
      return;
    }

    const newPingStatus = toConnectionStatus(pingRes.status);

    if (newPingStatus === "error") {
      // API returned 200 but body says "error" — bridge reported a problem
      security_node = { ...security_node, pingStatus: "error" };
      page.errorMessage = "Bridge reported an error reaching the security node";
      return;
    }

    if (newPingStatus === "unconnected") {
      // Node didn't respond — silent, out of range, or between wake cycles
      security_node = { ...security_node, pingStatus: "unconnected" };
      return;
    }

    // Node is alive — stamp the successful response time
    security_node = { ...security_node, pingStatus: "ok", pingTime: new Date() };

    // --- Stage 2: fetch status (non-fatal if it fails) ---
    try {
      await reqStatus();
    } catch (err: any) {
      page.errorMessage = err?.message ?? "Failed to fetch node status";
    }

    // --- Stage 3: fetch sensors (non-fatal if it fails) ---
    try {
      await reqSensors();
    } catch (err: any) {
      page.errorMessage = err?.message ?? "Failed to fetch sensor data";
    }
  }

  onMount(async () => {
    page.loading = true;
    await checkUART();
    page.loading = false;
    checkTour();
  });

  onDestroy(() => clearInterval(pingInterval));
</script>

<!-- Show LoaderPage while UART is being checked, or if it failed -->
{#if page.loading || page.uart_gateway !== "ok"}
  <LoaderPage
    state={page.uart_gateway}
    errorMessage={page.errorMessage}
    checkConnection={checkUART}
  />
{:else}
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <Toolbar pingStatus={security_node.pingStatus} lastPingAttempt={security_node.lastPingAttempt} />

    <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

      <!-- Dynamic status banner — 5 distinct states -->

      {#if security_node.pingStatus === "idle"}
        <!-- No poll has completed yet -->
        <div class="mb-6 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 dark:border-gray-700 dark:bg-gray-800/40">
          <span class="h-2 w-2 animate-pulse rounded-full bg-gray-400"></span>
          <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Waiting for first node poll…</span>
        </div>

      {:else if security_node.pingStatus === "ok" && security_node.sensors.length > 0}
        <!-- Node online and sending data -->
        <div class="mb-6 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 dark:border-green-800 dark:bg-green-950/40">
          <span class="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
          <span class="text-sm font-medium text-green-700 dark:text-green-400">System Online</span>
          <span class="ml-auto text-xs text-green-600 dark:text-green-500">
            Last fetch: {new Date(security_node.lastSync).toLocaleTimeString()}
          </span>
        </div>

      {:else if security_node.pingStatus === "ok" && security_node.sensors.length === 0}
        <!-- Node responded but sent no sensor data this cycle -->
        <div class="mb-6 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 dark:border-blue-800 dark:bg-blue-950/40">
          <span class="h-2 w-2 animate-pulse rounded-full bg-blue-400"></span>
          <span class="text-sm font-medium text-blue-700 dark:text-blue-400">
            Node online — no sensor data reported this cycle
          </span>
        </div>

      {:else if security_node.pingStatus === "unconnected"}
        <!-- Node silent — not responding to ping, likely between wake cycles -->
        <div class="mb-6 flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-2.5 dark:border-yellow-800 dark:bg-yellow-950/40">
          <span class="h-2 w-2 animate-pulse rounded-full bg-yellow-400"></span>
          <span class="text-sm font-medium text-yellow-700 dark:text-yellow-400">
            Node not responding — likely sleeping between wake cycles
          </span>
        </div>

      {:else}
        <!-- Error state — something broke in the chain, show the specific message -->
        <div class="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 dark:border-red-800 dark:bg-red-950/40">
          <span class="h-2 w-2 rounded-full bg-red-500"></span>
          <span class="text-sm font-medium text-red-700 dark:text-red-400">
            {page.errorMessage || "Node unreachable — check the ESP32 bridge link"}
          </span>
          <button onclick={pollPing} class="ml-auto shrink-0 text-xs text-red-500 underline hover:text-red-700">Retry</button>
        </div>
      {/if}

      <!-- Primary grid -->
      <div class="grid gap-4 sm:gap-6 md:grid-cols-2">
        <ThreatScoreCard threatScore={security_node.threatScore} />
        <WakeCycleCard nextWake={security_node.nextWake} sleepInterval={security_node.sleepInterval} />
        <div class="md:col-span-2">
          <SensorDataCard lastSync={security_node.lastSync} sensors={security_node.sensors} />
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
  bind:active={page.tourActive}
  bind:currentStep={page.currentStep}
  steps={tourSteps}
  oncomplete={handleTourComplete}
  onskip={handleTourSkip}
/>