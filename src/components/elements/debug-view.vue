<script setup lang="ts">
  interface DebugProps {
    show?: boolean;
    items: Record<string, any>;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  }

  withDefaults(defineProps<DebugProps>(), {
    show: false,
    position: 'top-right',
  });
</script>

<template>
  <div v-if="show" class="debug" :class="position">
    <div class="debug-item" v-for="(item, name) in items" :key="name">
      <div class="name">{{ name }}:</div>
      <div class="value">{{ JSON.stringify(item) }}</div>
    </div>
  </div>
</template>

<style lang="scss">
  .debug {
    pointer-events: none;
    position: absolute;
    display: flex;
    z-index: 100;
    flex-direction: column;
  }

  .debug.top-left {
    top: 0;
    left: 0;
    justify-items: flex-start;
  }

  .debug.top-right {
    top: 0;
    right: 0;
    justify-items: flex-end;
  }

  .debug.bottom-left {
    bottom: 0;
    left: 0;
    justify-items: flex-start;
  }

  .debug-item {
    gap: var(--sm);
    display: flex;
    border-radius: 3px;

    padding: var(--sm) var(--md);
    background-color: var(--color-100);
    + .debug-item {
      margin-top: calc(var(--sm) * -1);
    }
  }

  .debug.top-left .debug-item,
  .debug.bottom-left .debug-item {
    margin-right: auto;
  }

  .debug.top-right .debug-item,
  .debug.bottom-right .debug-item {
    margin-left: auto;
  }
</style>
