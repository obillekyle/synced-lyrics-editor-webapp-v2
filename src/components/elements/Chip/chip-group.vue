<script setup lang="ts">
  defineProps<{
    span?: boolean;
  }>();
</script>

<template>
  <div class="chip-group" :class="{ span }">
    <slot />
  </div>
</template>

<style lang="scss">
  .chip-group {
    display: flex;
    flex-wrap: nowrap;
    &.span {
      display: grid;
      width: 100%;
      grid-template-columns: repeat(auto-fit, minmax(0px, 1fr));
      .chip {
        width: 100%;
      }
    }

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
