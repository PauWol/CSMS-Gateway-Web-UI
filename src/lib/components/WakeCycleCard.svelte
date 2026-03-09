<script>
  import { Card, Badge, Progressbar } from "flowbite-svelte";
  import { ClockOutline } from "flowbite-svelte-icons";

  export let status;

  const now = Date.now();
  const nextWake = new Date(status.nextWake).getTime();
  const total = status.sleepInterval;
  const remaining = Math.max(nextWake - now, 0);
  const percent = Math.round(100 - (remaining / total) * 100);
  const remainingSecs = Math.floor(remaining / 1000);
  const wakeTime = new Date(status.nextWake).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
</script>

<Card id="wake-cycle-card" class="border border-gray-200 dark:border-gray-700 p-4 sm:p-6 md:p-8">
  <div class="flex items-start justify-between">
    <div>
      <p class="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
        Wake Cycle
      </p>
      <p class="mt-1 text-4xl font-black tabular-nums text-gray-900 dark:text-white">
        {remainingSecs}<span class="text-xl font-medium text-gray-400">s</span>
      </p>
    </div>
    <div class="rounded-xl bg-blue-100 p-2.5 dark:bg-blue-900/40">
      <ClockOutline class="h-6 w-6 text-blue-600 dark:text-blue-400" />
    </div>
  </div>

  <div class="mt-4 space-y-2">
    <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400">
      <span>Sleep progress</span>
      <span class="font-medium">{percent}%</span>
    </div>
    <Progressbar progress={percent} color="blue" size="h-2.5" class="rounded-full" />
  </div>

  <div class="mt-4 flex items-center justify-between">
    <Badge color="blue" class="rounded-md px-3 py-1 text-xs font-semibold">
      Next Wake: {wakeTime}
    </Badge>
    <span class="text-xs text-gray-400 dark:text-gray-500">{remainingSecs}s remaining</span>
  </div>
</Card>