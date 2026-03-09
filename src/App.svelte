<script lang="ts">
  import { onMount } from "svelte";
  import { Tour } from "flowbite-svelte";
  import WakeCycleCard from "./lib/components/WakeCycleCard.svelte";
  import ThreatScoreCard from "./lib/components/ThreatScoreCard.svelte";
  import SensorDataCard from "./lib/components/SensorDataCard.svelte";
  import ConfigUpdateCard from "./lib/components/ConfigUpdateCard.svelte";
  import { getStatus, getSensors, ping } from "./lib/api";
  import type { PageStatus, Status, Sensor } from "./lib/types";
  import Toolbar from "./lib/components/Toolbar.svelte";
  import LoaderPage from "./lib/components/LoaderPage.svelte";
  import { tourSteps, handleTourComplete, handleTourSkip, hasCompletedTour } from "./lib/tour.js";


  let status: Status | null = null;
  let sensors: Sensor[] = [];
  let lastSync = 0;
  let page: PageStatus = {
    loading: true,
    state: "checking",
    errorMessage: "",
    error: null
  };

  let tourActive = false;
  let currentStep = 0;

  function checkTour() {
    if (!hasCompletedTour()) tourActive = true;
  }

  async function loadData() {
    status = await getStatus();
    ({lastSync, sensors} = await getSensors());
    page.loading = false;
  }

  async function checkConnection() {
    page.state = "checking";
    page.errorMessage = "";
    page.error = null;
    try {
      await ping();
      page.state = "ok";
      await loadData();
      checkTour();
    } catch (err) {
      page.state = "error";
      page.errorMessage = err.message;
    }
  }

  onMount(() => checkConnection());
</script>

{#if page.loading}
  <LoaderPage state={page.state} errorMessage={page.errorMessage} checkConnection={checkConnection} />
{:else}
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <Toolbar />
    <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <!-- Status banner -->
      <div class="mb-6 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 dark:border-green-800 dark:bg-green-950/40">
        <span class="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
        <span class="text-sm font-medium text-green-700 dark:text-green-400">System Online</span>
      </div>

      <!-- Primary grid -->
      <div class="grid gap-4 sm:gap-6 md:grid-cols-2">
        <ThreatScoreCard {status} />
        <WakeCycleCard {status} />
        <!-- Sensor spans full width on md+ -->
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