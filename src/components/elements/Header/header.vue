<script setup lang="ts">
  import { inject, type Ref } from 'vue';

  const scrollHeight = inject<Ref<number>>('content-scroll-top')!;
  const headerTitle = inject<Ref<string>>('header-title')!;
</script>

<template>
  <div
    class="header"
    :class="{ 'on-top': scrollHeight < 6, 'has-title': headerTitle }"
  >
    <slot />
    <div class="title" v-if="headerTitle">{{ headerTitle }}</div>
    <div class="actions" v-if="$slots.actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style lang="scss">
  .header {
    display: flex;
    align-items: center;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    z-index: 100;
    padding-inline: var(--sm);
    padding-block: var(--sm);
    height: var(--app-header-height);
    background: var(--background-secondary);

    &.on-top {
      background: transparent;

      .title {
        color: transparent;
      }
    }

    .title {
      transition: color 0.2s;
      font-size: var(--font-xl);
    }
  }
</style>
