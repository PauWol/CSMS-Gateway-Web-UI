<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { Toolbar, ToolbarButton, ToolbarGroup, DarkMode, Tooltip } from "flowbite-svelte";
  import { FileChartBarOutline, ShieldCheckOutline } from "flowbite-svelte-icons";
  import LogRequestModal from "./LogRequestModal.svelte";

  export let pingStatus: "idle" | "ok" | "error" | "unconnected" = "idle";
  export let lastPingAttempt: Date | null = null;

  let open = false;
  let now = new Date();
  let clockInterval: ReturnType<typeof setInterval>;

  onMount(() => {
    // Tick every second so the "X ago" label stays fresh
    clockInterval = setInterval(() => { now = new Date(); }, 1000);
  });
  onDestroy(() => clearInterval(clockInterval));

  // `_now` is passed explicitly so Svelte sees it as a reactive dependency
  // and re-runs this every second when `now` ticks via the interval above.
  function timeAgo(date: Date | null, _now: Date): string {
    if (!date) return "never";
    const seconds = Math.floor((_now.getTime() - date.getTime()) / 1000);
    if (seconds < 5)  return "just now";
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  }

  $: dotColor =
    pingStatus === "ok"          ? "bg-green-500" :
    pingStatus === "unconnected" ? "bg-yellow-400" :
    pingStatus === "idle"        ? "bg-gray-400"   : "bg-red-500";

  $: dotLabel =
    pingStatus === "ok"          ? "Node Online"     :
    pingStatus === "unconnected" ? "Node Silent"     :
    pingStatus === "idle"        ? "Polling…"        : "Node Error";

  // now is referenced here directly — Svelte will re-run this reactive
  // statement every second when the interval updates `now`
  $: lastPolledText = timeAgo(lastPingAttempt, now);
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

      <!-- Live ping indicator + last-polled timestamp -->
      <div class="flex items-center gap-1.5 px-2">
        <span class="relative flex h-2 w-2">
          {#if pingStatus === "ok"}
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
          {/if}
          <span class="relative inline-flex h-2 w-2 rounded-full {dotColor}"></span>
        </span>
        <span class="hidden text-xs text-gray-500 dark:text-gray-400 sm:block">{dotLabel}</span>
        <span class="hidden text-xs text-gray-400 dark:text-gray-500 sm:block">·</span>
        <span class="hidden text-xs text-gray-400 dark:text-gray-500 sm:block">
          Polled {lastPolledText}
        </span>
      </div>
      <Tooltip>{dotLabel} — last polled {lastPolledText}</Tooltip>

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