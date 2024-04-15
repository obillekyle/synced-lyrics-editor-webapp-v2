<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { parse } from 'marked';

  const data = ref<string | null>(null);
  const error = ref<string | null>(null);

  async function fetchChangelog() {
    try {
      const response = await fetch('/changelog.md');
      data.value = await response.text();
    } catch (err: any) {
      error.value = err?.toString?.();
    }
  }

  onMounted(fetchChangelog);
</script>

<template>
  <div v-if="error">An error occurred: {{ error }}</div>
  <div v-else-if="!data">Loading...</div>
  <div
    v-else
    v-html="parse(data)"
    class="changelog marked-content"
  />
</template>
