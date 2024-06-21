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
  <button
    class="chip"
    :class="variant"
    :style="`--radius: ${getCSSValue(radius.toString())};`"
    @pointerdown="rippleEffect"
  >
    <ChipIcon v-if="leftIcon" class="left-icon" :icon="leftIcon" />
    <div class="label">
      <slot>{{ label }}</slot>
    </div>
    <ChipIcon v-if="rightIcon" class="right-icon" :icon="rightIcon" />
  </button>
</template>

<style lang="scss">
  .chip {
    position: relative;
    overflow: hidden;
    user-select: none;
    display: inline-flex;
    align-items: center;
    width: fit-content;
    border-radius: var(--radius);
    height: var(--size-xs);
    gap: var(--sm);
    border: none;
    font: inherit;
    font-weight: 600;
    color: var(--on-primary);
    background: var(--primary);
    padding-inline: var(--sm);
    transition: opacity 0.2s;
    box-shadow: var(--shadow-1);
    transition:
      filter 0.2s,
      background-color 0.2s;

    &:hover {
      filter: brightness(1.2);
    }

    & + & {
      margin-inline-start: var(--xs);
    }

    .label {
      align-self: center;
      text-align: center;
      flex-grow: 1;
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
      color: var(--primary-80);
      box-shadow: none;
    }

    &:disabled {
      background-color: var(--mono-30-50) !important;
      color: var(--mono-50) !important;
    }

    &.outline {
      border: 1px solid var(--primary-60-50);
    }

    &.subtle {
      background: var(--primary-50-20);
    }

    &.transparent,
    &.outline {
      background: none;
      &:hover {
        background: var(--primary-40-20);
      }
    }
  }
</style>
