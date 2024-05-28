<script setup lang="ts">
  import { type HTMLAttributes } from 'vue';
</script>

<template>
  <div class="chip-group">
    <slot></slot>
  </div>
</template>

<style lang="scss">
  .chip-group {
    .chip {
      border-radius: 0;
      margin: 0;
      &:not(:last-child) {
        border-right: none;
      }

      &:first-child {
        border-top-left-radius: var(--radius);
        border-bottom-left-radius: var(--radius);
      }

      &:last-child {
        border-top-right-radius: var(--radius);
        border-bottom-right-radius: var(--radius);
      }
    }
  }
</style>
