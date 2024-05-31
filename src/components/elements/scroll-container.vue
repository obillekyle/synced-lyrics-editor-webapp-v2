<script setup lang="ts">
  import { ref } from 'vue';

  defineProps<{
    scrollable?: boolean;
  }>();

  const element = ref<HTMLElement | null>(null);
</script>

<template>
  <div
    class="scroll-container"
    :class="{ scrollable: scrollable }"
    ref="element"
  >
    <slot />
  </div>
</template>

<style lang="scss">
  .scroll-container {
    overflow: auto;
    display: block;
    height: 100%;
    width: 100%;
    -ms-overflow-style: none;
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
  }
</style>
