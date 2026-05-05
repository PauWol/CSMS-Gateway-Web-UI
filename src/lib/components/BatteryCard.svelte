<script>
  import { Card, Badge, Progressbar } from "flowbite-svelte";

  export let volt = 0;
  export let tte_s = 0; // Estimated time till end of battery in seconds

  const minVolt = 5;
  const maxVolt = 7.2;
 
  function getBatteryColor(percent) {
    if (percent < 20) return "red";
    if (percent < 50) return "yellow";
    return "green";
  }

  $: batteryPercent = Math.round(((volt - minVolt) / (maxVolt - minVolt)) * 100);
  $: clampedPercent = Math.max(0, Math.min(100, batteryPercent));
  $: hours = Math.floor(tte_s / 3600);
  $: minutes = Math.floor((tte_s % 3600) / 60);
  $: timeRemaining = tte_s > 0 ? `${hours}h ${minutes}m` : "Unknown";
  $: color = getBatteryColor(clampedPercent);

</script>

<Card id="battery-card" class="border border-gray-200 dark:border-gray-700 p-4 sm:p-6 md:p-8">
  <div class="flex items-start justify-between">
    <div>
      <p class="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
        Battery Status
      </p>
      <p class="mt-1 text-4xl font-black tabular-nums text-gray-900 dark:text-white">
        {volt.toFixed(2)}<span class="text-xl font-medium text-gray-400">V</span>
      </p>
    </div>
    <div class="rounded-xl bg-gray-100 p-2.5 dark:bg-gray-800">
      <span class="text-sm font-semibold text-gray-700 dark:text-gray-200">BAT</span>
    </div>
  </div>

  <div class="mt-4 space-y-3">
    <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400">
      <span>Battery Level</span>
      <span class="font-medium">{clampedPercent}%</span>
    </div>
    <Progressbar progress={clampedPercent} color={color} size="h-2.5" class="rounded-full" />
    <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
      <span>Estimated runtime</span>
      <span class="font-medium">{timeRemaining}</span>
    </div>
  </div>
</Card>