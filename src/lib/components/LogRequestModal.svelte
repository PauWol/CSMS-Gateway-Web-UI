<script lang="ts">
  import { Button, Modal, Badge, Spinner, Alert } from "flowbite-svelte";
  import { DownloadOutline, CloseOutline, FileChartBarOutline } from "flowbite-svelte-icons";

  export let modalOpen = false;

  type RequestState = "idle" | "loading" | "success" | "error";
  let requestState: RequestState = "idle";
  let errorMsg = "";

  async function requestLogs() {
    requestState = "loading";
    errorMsg = "";
    try {
      // Replace with your actual API call, e.g.: await downloadLogs()
      await new Promise((res) => setTimeout(res, 1500)); // stub
      requestState = "success";
    } catch (err: any) {
      requestState = "error";
      errorMsg = err?.message ?? "Something went wrong.";
    }
  }

  function handleClose() {
    modalOpen = false;
    // Reset after modal closes
    setTimeout(() => {
      requestState = "idle";
      errorMsg = "";
    }, 300);
  }
</script>

<Modal bind:open={modalOpen} size="sm" autoclose={false}>
  <!-- Header -->
  <div class="flex items-center gap-3 border-b border-gray-200 pb-4 dark:border-gray-700">
    <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/40">
      <FileChartBarOutline class="h-5 w-5 text-primary-600 dark:text-primary-400" />
    </div>
    <div>
      <h3 class="font-semibold text-gray-900 dark:text-white">Request Logs</h3>
      <p class="text-xs text-gray-500 dark:text-gray-400">Fetch from Security-Node</p>
    </div>
  </div>

  <!-- Body -->
  <div class="space-y-4 py-2">
    <p class="text-sm text-gray-600 dark:text-gray-300">
      This will request the most recent activity logs from the Security-Node.
      The file will download automatically once retrieved.
    </p>

    <div class="rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
      <dl class="space-y-2 text-sm">
        <div class="flex justify-between">
          <dt class="text-gray-500 dark:text-gray-400">Format</dt>
          <dd class="font-medium text-gray-900 dark:text-white">
            <Badge color="blue" class="text-xs">CSV / JSON</Badge>
          </dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-gray-500 dark:text-gray-400">Source</dt>
          <dd class="font-medium text-gray-900 dark:text-white">Security-Node</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-gray-500 dark:text-gray-400">Coverage</dt>
          <dd class="font-medium text-gray-900 dark:text-white">Most recent session</dd>
        </div>
      </dl>
    </div>

    <!-- Status feedback -->
    {#if requestState === "success"}
      <Alert color="green" class="py-2 text-sm">
        Logs downloaded successfully.
      </Alert>
    {:else if requestState === "error"}
      <Alert color="red" class="py-2 text-sm">
        {errorMsg || "Failed to fetch logs. Please retry."}
      </Alert>
    {/if}
  </div>

  <!-- Footer actions -->
  <div class="flex items-center justify-end gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
    <Button color="light" onclick={handleClose} class="gap-1.5">
      <CloseOutline class="h-4 w-4" />
      Cancel
    </Button>
    <Button
      color="primary"
      onclick={requestLogs}
      disabled={requestState === "loading" || requestState === "success"}
      class="gap-1.5"
    >
      {#if requestState === "loading"}
        <Spinner size="4" />
        Fetching…
      {:else if requestState === "success"}
        Downloaded ✓
      {:else}
        <DownloadOutline class="h-4 w-4" />
        Download Logs
      {/if}
    </Button>
  </div>
</Modal>