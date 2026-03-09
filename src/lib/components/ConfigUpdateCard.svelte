<script>
  import { Card, Badge } from "flowbite-svelte";
  import { CodeBranchOutline } from "flowbite-svelte-icons";
</script>

<Card id="config-card" class="border border-dashed border-gray-300 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-800/30">
  <div class="flex flex-col items-center justify-center gap-3 py-6 text-center">
    <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
      <CodeBranchOutline class="h-6 w-6 text-gray-400 dark:text-gray-500" />
    </div>
    <div class="space-y-1">
      <div class="flex items-center justify-center gap-2">
        <h2 class="font-semibold text-gray-700 dark:text-gray-300">Configuration</h2>
        <Badge color="yellow" class="text-xs">Coming Soon</Badge>
      </div>
      <p class="max-w-xs text-sm text-gray-400 dark:text-gray-500">
        Remote configuration management will be integrated in a future release.
      </p>
    </div>
  </div>
</Card>