<script setup lang="ts">
  import type { HTMLAttributes } from 'vue';

  interface NavigationContentProps extends /* @vue-ignore */ HTMLAttributes {}

  defineOptions({
    inheritAttrs: false,
  });

  defineProps<NavigationContentProps>();
</script>

<template>
  <div class="nav-content" v-bind="$attrs">
    <slot />
  </div>
</template>

<style lang="scss">
  .nav-content {
    align-self: center;
  }

  .nav-item + .nav-content {
    margin-top: auto;
    padding-block: var(--sm);
  }
</style>
