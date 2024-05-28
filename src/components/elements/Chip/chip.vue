<script setup lang="ts">
  import type { ButtonHTMLAttributes, Component } from 'vue';
  import ChipIcon from './chip-icon.vue';
  import { getCSSValue, type AppSizes, rippleEffect } from '@/api/util';

  interface ChipProps extends /* @vue-ignore */ ButtonHTMLAttributes {
    leftIcon?: Component | string;
    rightIcon?: Component | string;
    label?: string;
    variant?: 'filled' | 'outline' | 'subtle' | 'transparent';
    radius?: AppSizes | number | 'rounded' | String;
  }

  withDefaults(defineProps<ChipProps>(), {
    radius: 'rounded',
  });
</script>

<template>
  <div
    class="chip"
    :class="variant"
    :style="`--radius: ${getCSSValue(radius.toString())};`"
    @pointerdown="rippleEffect"
  >
    <ChipIcon v-if="leftIcon" class="left-icon" :icon="leftIcon" />
    <slot>{{ label }}</slot>
    <ChipIcon v-if="rightIcon" class="right-icon" :icon="rightIcon" />
  </div>
</template>

<style lang="scss">
  .chip {
    user-select: none;
    display: inline-flex;
    align-items: center;
    position: relative;
    overflow: hidden;
    width: fit-content;
    border-radius: var(--radius);
    gap: var(--sm);
    border: none;
    font: inherit;
    font-weight: 600;
    color: var(--color-100);
    background: var(--color-700);
    padding: var(--xs) var(--md);
    transition: opacity 0.2s;
    box-shadow: 0 2px 6px #0005;
    transition:
      filter 0.2s,
      background-color 0.2s;

    &:hover {
      filter: brightness(1.2);
    }

    & + & {
      margin-inline-start: var(--xs);
    }

    .chip-icon {
      display: grid;
      place-items: center;
    }

    &:active {
      opacity: 0.8;
    }

    &:not(:disabled) {
      cursor: pointer;
    }

    &.outline,
    &.transparent,
    &.subtle {
      color: var(--color-800);
      box-shadow: none;
    }

    &.outline {
      border: 1px solid var(--color-600-50);
    }

    &.subtle {
      background: var(--color-500-20);
    }

    &.transparent,
    &.outline {
      background: none;
      &:hover {
        background: var(--color-400-20);
      }
    }
  }
</style>
