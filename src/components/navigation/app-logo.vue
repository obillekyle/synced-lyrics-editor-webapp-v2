<script setup lang="ts">
import _presets from '../modals/presets'
</script>

<template>
  <div class="app-logo">
    <div class="app-title" :onclick="_presets.changelog">
      Synced Lyrics Editor
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .app-logo {
    display: flex;
    grid-area: logo;
    border-left: 4px solid var(--primary-50, red);
    transition: border-color 3s;
    padding-inline-start: 4px;
    width: 64px;

    align-items: center;
    align-self: center;
    margin-block: var(--xl);
    gap: var(--sm);
  }

  .app-title {
    padding-top: 2px;
    line-height: 12px;
    font-size: var(--font-sm);
    font-weight: 600;
    white-space: pre-line;
    text-transform: uppercase;
  }
</style>
