<script setup lang="ts">
  defineProps<{
    span?: boolean;
  }>();
</script>

<template>
  <div class="button-group" :class="{ span }">
    <slot />
  </div>
</template>

<style lang="scss">
  .button-group {
    display: flex;
    flex-wrap: nowrap;
    &.span {
      display: grid;
      width: 100%;
      grid-template-columns: repeat(auto-fit, minmax(0px, 1fr));
      .button {
        width: 100%;
      }
    }
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
