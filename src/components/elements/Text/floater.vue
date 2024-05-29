<script setup lang="ts">
  import {
    type ColorString,
    getCSSColor,
    type AppSizes,
    getCSSValue,
  } from '@/api/util';
  import type { Component } from 'vue';

  type Positions =
    | 'top'
    | 'top-left'
    | 'top-right'
    | 'left'
    | 'right'
    | 'center'
    | 'bottom'
    | 'bottom-left'
    | 'bottom-right';

  withDefaults(
    defineProps<{
      text?: Component | string;
      color?: ColorString;
      offset?: AppSizes | number | String;
      size?: AppSizes | number | String;
      pos?: Positions;
    }>(),
    {
      color: 'color-200',
      offset: 0,
      size: 'xxs',
      pos: 'top-right',
    }
  );
</script>

<template>
  <div class="floater">
    <div
      class="floater-text"
      :class="pos"
      :style="{
        '--offset': getCSSValue(offset),
        background: getCSSColor(color),
        fontSize: getCSSValue(size, 'px', 'font'),
      }"
    >
      <span v-if="typeof text == 'string'">{{ text }}</span>
      <component v-else :is="text" />
    </div>
    <slot />
  </div>
</template>

<style lang="scss">
  .floater {
    position: relative;
    width: max-content;
    height: max-content;

    .floater-text {
      display: flex;
      position: absolute;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      padding: 1px 3px;
      border-radius: 999px;
      z-index: 1;
      box-shadow: 0 0 2px var(--mono-600);
      font-size: var(--sm);

      &.top {
        top: var(--offset);
        left: 50%;
        transform: translateX(-50%);
      }

      &.left {
        left: var(--offset);
        top: 50%;
        transform: translateY(-50%);
      }

      &.right {
        right: var(--offset);
        top: 50%;
        transform: translateY(-50%);
      }

      &.center {
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }

      &.bottom {
        left: 50%;
        bottom: var(--offset);
        transform: translateX(-50%);
      }

      &.top-left {
        top: var(--offset);
        left: var(--offset);
      }

      &.top-right {
        top: var(--offset);
        right: var(--offset);
      }

      &.bottom-left {
        bottom: var(--offset);
        left: var(--offset);
      }

      &.bottom-right {
        bottom: var(--offset);
        right: var(--offset);
      }
    }
  }
</style>
