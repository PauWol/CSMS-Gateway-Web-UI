<script>
  import { Spinner, Button } from "flowbite-svelte";
  import { ShieldCheckOutline, ExclamationCircleOutline } from "flowbite-svelte-icons";

  export let state = "checking"; // checking | connected | error
  export let errorMessage = "";
  export let checkConnection;
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
  <div class="w-full max-w-sm space-y-6 text-center">

    <!-- Logo mark -->
    <div class="flex justify-center">
      <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600 shadow-lg dark:bg-primary-500">
        <ShieldCheckOutline class="h-8 w-8 text-white" />
      </div>
    </div>

    <div>
      <h1 class="text-xl font-bold text-gray-900 dark:text-white">CSMS</h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Connecting to Gateway Node…</p>
    </div>

    <!-- States -->
    {#if state === "checking"}
      <div class="flex flex-col items-center gap-3">
        <Spinner size="8" color="blue" />
        <p class="text-sm text-gray-500 dark:text-gray-400">Establishing connection…</p>
      </div>

    {:else if state === "ok"}
      <div class="flex flex-col items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
          <ShieldCheckOutline class="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <p class="font-semibold text-green-600 dark:text-green-400">Connected</p>
          <p class="mt-0.5 text-sm text-gray-400">Loading dashboard…</p>
        </div>
      </div>

    {:else if state === "error"}
      <div class="space-y-4">
        <div class="flex flex-col items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
            <ExclamationCircleOutline class="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p class="font-semibold text-red-600 dark:text-red-400">Connection Failed</p>
            {#if errorMessage}
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{errorMessage}</p>
            {/if}
          </div>
        </div>
        <Button
          onclick={checkConnection}
          color="primary"
          class="w-full"
        >
          Retry Connection
        </Button>
      </div>
    {/if}

  </div>
</div>