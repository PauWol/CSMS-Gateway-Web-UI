<script>
  import { Spinner, Button } from "flowbite-svelte";
  import { ShieldCheckOutline, ExclamationCircleOutline } from "flowbite-svelte-icons";

  export let state = null;  // null = checking, "ok" = connected, "error"/"unconnected" = failed
  export let errorMessage = "";
  export let checkConnection;
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
  <div class="w-full max-w-sm space-y-6 text-center">

    <!-- Logo -->
    <div class="flex justify-center">
      <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600 shadow-lg dark:bg-primary-500">
        <ShieldCheckOutline class="h-8 w-8 text-white" />
      </div>
    </div>

    <div>
      <h1 class="text-xl font-bold text-gray-900 dark:text-white">CSMS</h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Coop Security & Monitoring System</p>
    </div>

    {#if state === null}
      <!-- Checking UART bridge -->
      <div class="flex flex-col items-center gap-3">
        <Spinner size="8" color="blue" />
        <p class="text-sm text-gray-500 dark:text-gray-400">Checking ESP32 bridge connection…</p>
      </div>

    {:else}
      <!-- UART failed — state is "error" or "unconnected" -->
      <div class="space-y-4">
        <div class="flex flex-col items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
            <ExclamationCircleOutline class="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p class="font-semibold text-red-600 dark:text-red-400">ESP32 Bridge Unreachable</p>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {errorMessage || "Cannot connect to the UART bridge. Check that the ESP32 is powered and connected."}
            </p>
          </div>
        </div>
        <Button onclick={checkConnection} color="primary" class="w-full">
          Retry Connection
        </Button>
      </div>
    {/if}

  </div>
</div>