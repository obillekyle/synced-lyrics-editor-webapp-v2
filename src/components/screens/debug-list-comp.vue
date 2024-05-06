<script setup lang="ts">
  import { Icon } from '@iconify/vue/dist/iconify.js';

  defineProps<{
    title: string;
    icon?: string;
  }>();
</script>

<template>
  <div class="debug-test-list">
    <Icon :icon="icon" v-if="icon" :width="24" />
    {{ title }}
  </div>
</template>

<style lang="scss">
  .debug-test-list {
    display: flex;
    align-items: center;
    gap: var(--sm);
    padding-inline: var(--md);
  }
</style>
