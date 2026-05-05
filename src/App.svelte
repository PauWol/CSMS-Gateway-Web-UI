<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { Tour } from "flowbite-svelte";
  import WakeCycleCard from "./lib/components/WakeCycleCard.svelte";
  import ThreatScoreCard from "./lib/components/ThreatScoreCard.svelte";
  import SensorDataCard from "./lib/components/SensorDataCard.svelte";
  import ConfigUpdateCard from "./lib/components/ConfigUpdateCard.svelte";
  import BatteryCard from "./lib/components/BatteryCard.svelte";
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
    pingStatus: "idle",
    pingTime: new Date(0),
    lastPingAttempt: null,
    threshold: 0,
    phase: "UNKNOWN",
    volt: 0,
    tte_s: 0
  };

  let pollInterval: ReturnType<typeof setInterval>;

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

  // Checks the UART bridge. On success, starts the data polling loop.
  async function checkUART() {
    page.uart_gateway = null;
    try {
      const res = await uart_ping();
      page.uart_gateway = toConnectionStatus(res.status);
    } catch (err: any) {
      page.uart_gateway = "error";
      page.errorMessage = err?.message ?? "UART check failed";
      return;
    }

    if (page.uart_gateway === "ok") {
      clearInterval(pollInterval);
      pollData();
      pollInterval = setInterval(pollData, POLL_INTERVAL);
    }
  }

  async function reqSensors() {
    const sensors = await getSensors();
    security_node = { ...security_node, sensors };
  }

  async function reqStatus() {
    const res = await getStatus();
    console.log(res)
    security_node = {
      ...security_node,
      sleepInterval: res.sleepInterval,          // ms, from ESP32 FLAG_SLEEP
      lastSync: res.lastSync,                    // Unix seconds, from Pi time.time()
      threatScore: res.threatScore,
      threshold: res.threshold,
      phase: res.phase,
      volt: res.volt,
      tte_s: res.tte_s,
      // lastSync (s) → ms; sleepInterval already in ms
      nextWake: res.lastSync * 1000 + res.sleepInterval,
    };
  }

  // ── Main poll loop ─────────────────────────────────────────────────────────
  // Status and sensor data are always fetched — the Pi caches the last received
  // binary frame from the ESP32, so these endpoints return valid data even when
  // the security node is currently sleeping.  The mesh ping is a separate check
  // that only updates the reachability indicator.
  async function pollData() {
    security_node = { ...security_node, lastPingAttempt: new Date() };
    page.errorMessage = "";

    // --- Stage 1: fetch cached status from the Pi (always) ---
    try {
      await reqStatus();
    } catch (err: any) {
      page.errorMessage = err?.message ?? "Failed to fetch node status";
    }

    // --- Stage 2: fetch cached sensors from the Pi (always) ---
    try {
      await reqSensors();
    } catch (err: any) {
      page.errorMessage = err?.message ?? "Failed to fetch sensor data";
    }

    // --- Stage 3: ping the security node to update reachability indicator ---
    try {
      const pingRes = await ping();
      const newPingStatus = toConnectionStatus(pingRes.status);
      security_node = {
        ...security_node,
        pingStatus: newPingStatus,
        ...(newPingStatus === "ok" ? { pingTime: new Date() } : {}),
      };
    } catch (err: any) {
      security_node = { ...security_node, pingStatus: "error" };
      page.errorMessage = err?.message ?? "Ping request failed";
    }
  }

  onMount(async () => {
    page.loading = true;
    await checkUART();
    page.loading = false;
    checkTour();
  });

  onDestroy(() => clearInterval(pollInterval));
</script>

<!-- LoaderPage covers initial check and any UART failure -->
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

      <!-- Node status banner — UART is confirmed OK at this point, so this
           banner is purely about the security node's mesh reachability -->

      {#if security_node.pingStatus === "idle"}
        <div class="mb-6 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 dark:border-gray-700 dark:bg-gray-800/40">
          <span class="h-2 w-2 animate-pulse rounded-full bg-gray-400"></span>
          <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Contacting security node…</span>
        </div>

      {:else if security_node.pingStatus === "ok"}
        <div class="mb-6 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 dark:border-green-800 dark:bg-green-950/40">
          <span class="relative flex h-2 w-2 shrink-0">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
            <span class="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
          </span>
          <span class="text-sm font-medium text-green-700 dark:text-green-400">
            Node Online
            {#if security_node.phase !== "UNKNOWN"}
              <span class="ml-1 font-normal opacity-70">({security_node.phase})</span>
            {/if}
          </span>
          {#if security_node.lastSync > 0}
            <span class="ml-auto text-xs text-green-600 dark:text-green-500">
              Last data: {new Date(security_node.lastSync * 1000).toLocaleTimeString()}
            </span>
          {/if}
        </div>

      {:else if security_node.pingStatus === "unconnected"}
        <!-- Node not responding — most likely in its deep-sleep interval, which is normal -->
        <div class="mb-6 flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-2.5 dark:border-yellow-800 dark:bg-yellow-950/40">
          <span class="h-2 w-2 animate-pulse rounded-full bg-yellow-400 shrink-0"></span>
          <span class="text-sm font-medium text-yellow-700 dark:text-yellow-400">
            Node not responding — may be sleeping between wake cycles
          </span>
          {#if security_node.lastSync > 0}
            <span class="ml-auto shrink-0 text-xs text-yellow-600 dark:text-yellow-500">
              Last data: {new Date(security_node.lastSync * 1000).toLocaleTimeString()}
            </span>
          {/if}
        </div>

      {:else}
        <!-- Error — something failed in the mesh link or the Pi-side request -->
        <div class="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 dark:border-red-800 dark:bg-red-950/40">
          <span class="h-2 w-2 rounded-full bg-red-500 shrink-0"></span>
          <span class="text-sm font-medium text-red-700 dark:text-red-400">
            {page.errorMessage || "Node unreachable — check the ESP32 mesh link"}
          </span>
          <button onclick={pollData} class="ml-auto shrink-0 text-xs text-red-500 underline hover:text-red-700">
            Retry
          </button>
        </div>
      {/if}

      <!-- Primary grid -->
      <div class="grid gap-4 sm:gap-6 md:grid-cols-2">
        <ThreatScoreCard threatScore={security_node.threatScore} threshold={security_node.threshold} />
        <BatteryCard volt={security_node.volt} tte_s={security_node.tte_s} />
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