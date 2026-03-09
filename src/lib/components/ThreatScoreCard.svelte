<script>
  import { Card, Badge, Progressbar } from "flowbite-svelte";
  import { ShieldCheckSolid } from "flowbite-svelte-icons";

  export let status;
  const score = status.threatScore;

  function getColor(score) {
    if (score < 30) return "green";
    if (score < 70) return "yellow";
    return "red";
  }

  function getLabel(score) {
    if (score < 30) return "Low Risk";
    if (score < 70) return "Moderate";
    return "High Risk";
  }

  const color = getColor(score);
  const label = getLabel(score);
</script>

<Card id="threat-score-card" class="border border-gray-200 dark:border-gray-700 p-4 sm:p-6 md:p-8">
  <div class="flex items-start justify-between">
    <div>
      <p class="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
        Threat Assessment
      </p>
      <p class="mt-1 text-4xl font-black tabular-nums text-gray-900 dark:text-white">
        {score}<span class="text-xl font-medium text-gray-400">/100</span>
      </p>
    </div>
    <div class="rounded-xl p-2.5
      {color === 'green' ? 'bg-green-100 dark:bg-green-900/40' :
       color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/40' :
       'bg-red-100 dark:bg-red-900/40'}">
      <ShieldCheckSolid class="h-6 w-6
        {color === 'green' ? 'text-green-600 dark:text-green-400' :
         color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
         'text-red-600 dark:text-red-400'}" />
    </div>
  </div>

  <div class="mt-4 space-y-2">
    <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400">
      <span>Risk Level</span>
      <span class="font-medium">{label}</span>
    </div>
    <Progressbar
      progress={score}
      {color}
      size="h-2.5"
      class="rounded-full"
    />
  </div>

  <div class="mt-4">
    <Badge color={color} class="rounded-md px-3 py-1 text-xs font-semibold">
      {label} — Score {score}
    </Badge>
  </div>
</Card>