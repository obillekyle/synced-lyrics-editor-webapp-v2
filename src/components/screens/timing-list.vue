<script setup lang="ts">
  import type { LRCLine } from '@/api/parser';

  defineProps<LRCLine>();
</script>

<template>
  <div class="timing-list">
    <span>
      {{ typeof data == 'string' ? data : data.join('') }}
    </span>
  </div>
</template>
