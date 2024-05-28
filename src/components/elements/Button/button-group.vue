<script setup lang="ts">
  import { type HTMLAttributes } from 'vue';
</script>

<template>
  <div class="button-group">
    <slot></slot>
  </div>
</template>

<style lang="scss">
  .button-group {
    .button {
      margin: 0;
      border-radius: 0;
      margin-inline: 0 !important;
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
