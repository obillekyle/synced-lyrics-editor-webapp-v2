<script setup lang="ts">
  import { parse } from 'marked';

  defineProps<{
    data?: string;
  }>();
</script>

<template>
  <div v-html="parse(data || 'No data')" class="changelog marked-content" />
</template>
