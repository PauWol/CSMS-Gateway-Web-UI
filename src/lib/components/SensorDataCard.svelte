<script>
  import { Card, Table, TableHead, TableHeadCell, TableBody, TableBodyCell, TableBodyRow, Badge } from "flowbite-svelte";

  export let sensors = [];
  export let lastSync = 0;

  function getValueBadge(value) {
    if (typeof value === "boolean") return value ? "green" : "red";
    return "default";
  }

  // Only show a last-fetch badge if we've actually received data before
  $: hasEverSynced = lastSync > 0;
</script>

<Card id="sensor-data-card" class="w-full border border-gray-200 dark:border-gray-700 p-4" size="xl">
  <div class="mb-4 flex items-center justify-between">
    <div>
      <p class="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
        Sensor Data
      </p>
      <p class="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{sensors.length} active sensors</p>
    </div>
    {#if hasEverSynced}
      <Badge color="blue" class="rounded-md px-3 py-1 text-xs">
        Last fetch: {new Date(lastSync).toLocaleTimeString()}
      </Badge>
    {:else}
      <Badge color="gray" class="rounded-md px-3 py-1 text-xs">No data yet</Badge>
    {/if}
  </div>

  <div class="overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-700">
    <Table hoverable striped class="min-w-full text-sm">
      <TableHead class="bg-gray-50 text-xs uppercase dark:bg-gray-800">
        <TableHeadCell class="px-4 py-3">Sensor</TableHeadCell>
        <TableHeadCell class="px-4 py-3">Value</TableHeadCell>
        <TableHeadCell class="hidden px-4 py-3 sm:table-cell">Timestamp</TableHeadCell>
      </TableHead>
      <TableBody>
        {#each sensors as sensor}
          <TableBodyRow>
            <TableBodyCell class="px-4 py-3 font-medium text-gray-900 dark:text-white">
              {sensor.name}
            </TableBodyCell>
            <TableBodyCell class="px-4 py-3">
              <span class="font-mono text-gray-700 dark:text-gray-300">{sensor.value}</span>
            </TableBodyCell>
            <TableBodyCell class="hidden px-4 py-3 text-gray-500 dark:text-gray-400 sm:table-cell">
              {new Date(sensor.timestamp).toLocaleTimeString()}
            </TableBodyCell>
          </TableBodyRow>
        {/each}

        {#if sensors.length === 0}
          <TableBodyRow>
            <TableBodyCell colspan={3} class="py-8 text-center">
              <p class="text-sm text-gray-400 dark:text-gray-500">
                No sensor data reported this cycle
              </p>
              <p class="mt-1 text-xs text-gray-300 dark:text-gray-600">
                The node may be conserving energy — data will appear on the next wake
              </p>
            </TableBodyCell>
          </TableBodyRow>
        {/if}
      </TableBody>
    </Table>
  </div>
</Card>