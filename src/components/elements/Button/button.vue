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

    height: var(--size-sm);
    width: max-content;
    min-width: var(--size-sm);
    border-radius: var(--radius);
    overflow: hidden;
    border: none;
    font: inherit;
    justify-content: center;
    font-weight: 500;
    color: var(--on-primary);
    background: var(--primary);
    transition: opacity 0.2s;
    padding-inline: var(--sm);
    gap: var(--xs);
    box-shadow: var(--shadow-2);
    transition:
      filter 0.2s,
      background-color 0.2s,
      opacity 0.2s;

    &:not(:disabled):hover {
      filter: brightness(1.2);
    }

    .label {
      align-self: center;
      text-align: center;
      flex-grow: 1;
    }

    &:not(:has(.left-icon)) {
      padding-inline-start: var(--md);
    }

    &:not(:has(.right-icon)) {
      padding-inline-end: var(--md);
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
      color: var(--primary-80);
      box-shadow: none;
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

    &:disabled {
      background-color: var(--mono-30-50) !important;
      color: var(--mono-50) !important;
    }

    &:active {
      opacity: 0.8;
    }

    &.inverted {
      color: var(--primary-90);
      background: var(--primary-20);

      &:hover {
        filter: brightness(0.8);
      }

      &:disabled {
        background-color: var(--mono-80-50) !important;
        color: var(--mono-60) !important;
      }

      &.outline {
        border: 1px solid var(--primary-20-30);
      }
    }
  }
</style>
