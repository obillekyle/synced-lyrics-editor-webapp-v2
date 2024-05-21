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
    @click="rippleEffect"
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
    width: fit-content;
    border-radius: var(--radius);
    gap: var(--sm);
    overflow: hidden;
    border: none;
    font: inherit;
    font-weight: 600;
    color: var(--color-100);
    background: var(--color-700);
    padding-inline: var(--lg);
    transition: opacity 0.2s;
    box-shadow: 0 2px 6px #0005;
    transition:
      filter 0.2s,
      background-color 0.2s;

    & + & {
      margin-inline-start: var(--xs);
    }

    &:hover {
      filter: brightness(1.2);
    }

    .button-icon {
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
      border: 1px solid var(--color-800-30);
    }

    &.subtle {
      background: var(--color-400-10);
    }

    &.transparent,
    &.outline {
      background: none;
      &:hover {
        background: var(--color-400-10);
      }
    }

    &:disabled {
      background-color: var(--mono-300-50);
      color: var(--mono-500);
    }
  }
</style>
