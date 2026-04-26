<script lang="ts">
  import { Toolbar, ToolbarButton, ToolbarGroup, DarkMode, Tooltip } from "flowbite-svelte";
  import { FileChartBarOutline, ShieldCheckOutline } from "flowbite-svelte-icons";
  import LogRequestModal from "./LogRequestModal.svelte";

  export let pingStatus: "ok" | "error" | "unconnected" = "ok";

  let open = false;

  $: dotColor =
    pingStatus === "ok"      ? "bg-green-500" :
    pingStatus === "unconnected" ? "bg-yellow-400" : "bg-red-500";

  $: dotLabel =
    pingStatus === "ok"      ? "ESP32 Online" :
    pingStatus === "unconnected" ? "ESP32 Unreachable" : "ESP32 Error";
</script>

<Toolbar
  id="toolbar"
  class="sticky top-0 z-50 border-b border-gray-200 bg-white/90 px-4 shadow-sm backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/90 sm:px-6"
>
  <ToolbarGroup id="toolbar-logo" class="p-1">
    <div class="flex items-center gap-2.5">
      <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 dark:bg-primary-500">
        <ShieldCheckOutline class="h-4 w-4 text-white" />
      </div>
      <div class="flex flex-col leading-none">
        <span id="csms" class="text-sm font-bold tracking-wider text-gray-900 dark:text-white">CSMS</span>
        <span class="hidden text-[10px] font-medium text-gray-400 sm:block">Security & Monitoring</span>
      </div>
    </div>
    <Tooltip>Coop Security & Monitoring System</Tooltip>
  </ToolbarGroup>

  {#snippet end()}
    <div class="flex items-center gap-1">

      <!-- Live ping indicator -->
      <div class="flex items-center gap-1.5 px-2">
        <span class="relative flex h-2 w-2">
          {#if pingStatus === "ok"}
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
          {/if}
          <span class="relative inline-flex h-2 w-2 rounded-full {dotColor}"></span>
        </span>
        <span class="hidden text-xs text-gray-500 dark:text-gray-400 sm:block">{dotLabel}</span>
      </div>
      <Tooltip>{dotLabel}</Tooltip>

      <ToolbarButton
        id="log-request-button"
        onclick={() => (open = true)}
        class="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <FileChartBarOutline class="h-5 w-5 text-gray-600 dark:text-gray-300" />
      </ToolbarButton>
      <Tooltip>Request Logs</Tooltip>

      <ToolbarButton id="dark-mode-button" class="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
        <DarkMode class="text-gray-600 dark:text-gray-300" />
      </ToolbarButton>
    </div>
  {/snippet}
</Toolbar>

<LogRequestModal bind:modalOpen={open} />