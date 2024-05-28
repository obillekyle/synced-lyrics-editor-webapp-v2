<script setup lang="ts">
  import { inject, type Ref } from 'vue';
  import type { LineItem } from '../helper';

  const lines = inject<Ref<LineItem[]>>('lines')!;
  const line = inject<Ref<number>>('line')!;
</script>

<template>
  <div class="line-number">
    <div
      :key="id"
      class="number"
      :class="{ active: line == index }"
      v-for="({ id }, index) in lines"
    >
      {{ index + 1 }}
    </div>
  </div>
</template>
