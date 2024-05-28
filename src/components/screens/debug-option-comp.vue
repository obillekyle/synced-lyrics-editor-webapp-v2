<script setup lang="ts">
  defineProps<{
    id: string | number;
    name: string;
  }>();
</script>

<template>
  <div class="debug-test-option">
    {{ name }}
  </div>
</template>

<style lang="scss">
  .debug-test-option {
    display: flex;
    align-items: center;
    gap: var(--sm);
    padding-inline: var(--md);
  }
</style>
