<script setup lang="ts">
  import { type ButtonHTMLAttributes, type Component } from 'vue';

  import { type AppSizes, getCSSValue, rippleEffect } from '@/api/util';

  import ButtonIcon from './button-icon.vue';

  interface ButtonProps extends /* @vue-ignore */ ButtonHTMLAttributes {
    leftIcon?: string | Component;
    rightIcon?: string | Component;
    radius?: AppSizes | 'rounded' | String | number;
    variant?: 'filled' | 'outline' | 'transparent' | 'subtle';
    label?: string;
  }

  withDefaults(defineProps<ButtonProps>(), {
    radius: 'rounded',
  });

  defineOptions({
    name: 'Button',
    inheritAttrs: false,
  });
</script>

<template>
  <button
    v-bind="$attrs"
    class="button"
    :class="variant"
    type="button"
    :style="`--radius: ${getCSSValue(radius.toString())};`"
    @pointerdown="rippleEffect"
  >
    <ButtonIcon v-if="leftIcon" class="left-icon" :icon="leftIcon" />
    <div class="label">
      <slot>{{ label }}</slot>
    </div>
    <ButtonIcon v-if="rightIcon" class="right-icon" :icon="rightIcon" />
  </button>
</template>

<style lang="scss" scoped>
  .button {
    display: inline-flex;
    align-items: center;
    height: var(--size-lg);
    width: max-content;
    min-width: 6ch;
    border-radius: var(--radius);
    overflow: hidden;
    border: none;
    font: inherit;
    justify-content: center;
    font-weight: 600;
    color: var(--color-100);
    background: var(--color-700);
    transition: opacity 0.2s;
    padding-inline: var(--md);
    gap: var(--md);
    box-shadow: 0 2px 6px #0005;
    transition:
      filter 0.2s,
      background-color 0.2s;

    &:not(:disabled):hover {
      filter: brightness(1.2);
    }

    .label {
      align-self: center;
      text-align: center;
    }

    &:not(:has(.left-icon)) {
      padding-inline-start: var(--xl);
    }

    &:not(:has(.right-icon)) {
      padding-inline-end: var(--xl);
    }

    .button-icon {
      display: grid;
      width: max-content;
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
      border: 1px solid var(--color-800-30);
    }

    &.subtle {
      background: var(--color-500-20);
    }

    &.transparent,
    &.outline {
      background: none;
      &:hover {
        background: var(--color-400-10);
      }
    }

    &:disabled {
      background-color: var(--mono-300-50) !important;
      color: var(--mono-500) !important;
    }

    &.inverted {
      color: var(--color-900);
      background: var(--color-200);

      &:hover {
        filter: brightness(0.8);
      }

      &:disabled {
        background-color: var(--mono-800-50) !important;
        color: var(--mono-600) !important;
      }

      &.outline {
        border: 1px solid var(--color-200-30);
      }
    }
  }
</style>
