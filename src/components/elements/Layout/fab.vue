<script setup lang="ts">
  import { keyboardClick, rippleEffect } from '@/api/util';
  import { Icon } from '@iconify/vue/dist/iconify.js';
  import { inject, type ButtonHTMLAttributes, type Ref, ref } from 'vue';

  interface FabProps extends /* @vue-ignore */ ButtonHTMLAttributes {
    icon: string;
  }
  const scrollTop = inject<Ref<number>>('content-scroll-top')!;
  defineProps<FabProps>();
</script>

<template>
  <button
    class="fab"
    :class="{ 'on-top': scrollTop < 6 }"
    @pointerdown="rippleEffect"
    @keydown="keyboardClick"
  >
    <Icon
      class="icon"
      v-if="typeof icon == 'string'"
      :icon="icon"
      :width="24"
    />
    <div class="label" v-if="$slots.default">
      <slot />
    </div>
  </button>
</template>

<style lang="scss">
  .fab {
    position: absolute;
    bottom: var(--padding-md);
    right: var(--padding-md);
    padding-inline: var(--padding-md);
    height: var(--fab-size);
    border-radius: var(--padding-md);
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--primary-container);
    color: var(--on-primary-container);
    box-shadow: var(--shadow-3);
    outline: none;
    border: none;
    z-index: 10;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
    overflow: hidden;
    .label {
      max-width: 0px;
      opacity: 0;
      margin-top: var(--padding-xxs);
      font-size: var(--font-md);
      transition: all 0.2s var(--timing-standard);
    }
    &.on-top .label {
      opacity: 1;
      padding-left: var(--padding-sm);
      max-width: 300px;
    }
  }
</style>
