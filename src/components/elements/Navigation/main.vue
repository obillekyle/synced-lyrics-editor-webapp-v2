<script setup lang="ts">
  import type { NavigationBarProps } from './type';
  import { type HTMLAttributes, provide, ref } from 'vue';

  interface Props
    extends NavigationBarProps,
      /* @vue-ignore */ HTMLAttributes {}

  const props = withDefaults(defineProps<Props>(), {
    labels: 'always',
    active: -1,
  });
  const count = ref(0);
  const parent = ref<HTMLDivElement | null>(null);

  provide('parent-props', props);
  provide('parent', parent);
  provide('count', count);
</script>
<template>
  <div class="navigation-bar" :class="labels" ref="parent">
    <slot />
  </div>
</template>

<style lang="scss">
  .navigation-bar {
    display: flex;
    position: fixed;
    flex-direction: column;
    height: 100dvh;
    left: 0;
    top: 0;
    bottom: 0;
    width: var(--app-navbar-size, 88px);
    background: var(--app-navbar-color);

    .nav-container {
      display: flex;
      position: absolute;
      justify-content: center;
      flex-direction: column;
      inset: 0;
    }

    .nav-container + .nav-content {
      margin-top: auto;
    }

    .nav-item {
      display: grid;
      font: inherit;
      border: none;
      justify-content: center;
      background: none;
      user-select: none;
      color: var(--color-800);
      padding-block: var(--sm);
      margin-bottom: var(--sm);
      .icon {
        align-self: end;
        margin-bottom: 4px;
        border-radius: 999px;
        display: grid;
        position: relative;
        overflow: hidden;
        justify-self: center;
        place-items: center;
        width: var(--size-lg);
        height: var(--icon-lg);
        font-size: var(--icon-md);
        contain: content;
        transition: background-color 0.2s;
        * {
          transition: scale 0.2s;
        }
        &::before {
          z-index: -1;
          content: '';
          display: block;
          position: absolute;
          inset: 0;
          width: var(--size-sm);
          margin-inline: auto;
          transition:
            width 0.2s,
            background-color 0.2s;
          border-radius: inherit;
        }
      }
      .name {
        font-size: var(--font-xs);
        font-weight: 500;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        transform: translateY(0);
        transition:
          max-height 0.2s,
          transform 0.2s,
          opacity 0.2s;
      }
      * {
        pointer-events: none;
      }
    }

    &.hidden .nav-item,
    &.active .nav-item {
      margin-bottom: 0;
      padding-top: var(--md);
      padding-bottom: 0;
    }

    &.hidden .nav-item .name,
    &.active .nav-item:not(.active) .name {
      transform: translateY(50%);
      opacity: 0;
    }

    .nav-item:active .icon > * {
      scale: 0.9;
    }

    .nav-item:hover .icon {
      background-color: var(--color-400-20);
    }

    .nav-item.active {
      .name {
        color: var(--color-900);
      }
      .icon {
        color: var(--color-900);
        &::before {
          background-color: var(--color-300);
          width: var(--size-lg);
        }
      }
    }
  }

  @media screen and (max-width: 600px) {
    .navigation-bar {
      width: 100dvw;
      height: var(--app-navbar-size, 88px);
      inset: auto 0 0 0;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(0px, 1fr));

      &:has(.nav-container) {
        grid-template-columns: minmax(0px, 1fr);
      }

      .nav-container {
        margin-block: 0;
        grid-template-columns: repeat(auto-fit, minmax(0px, 1fr));
        display: grid;
      }

      &.hidden .nav-item .name,
      &.active .nav-item:not(.active) .name {
        opacity: 0;
        transform: translateY(100%);
      }

      &.hidden .nav-item .icon,
      &.active .nav-item:not(.active) .icon {
        transform: translateY(30%);
      }

      .nav-item {
        margin-bottom: 0;
        padding-top: var(--sm);
        .name {
          max-height: var(--size-sm);
          font-size: var(--font-md);
        }
        .icon {
          font-size: var(--icon-lg);
          height: var(--size-sm);
          width: var(--size-xl);
          transition: transform 0.25s var(--timing-standard);
        }

        &.active {
          .name {
            opacity: 1;
          }
          .icon::before {
            width: var(--size-xl);
          }
        }
      }

      .nav-content {
        display: none;
      }
    }
  }
</style>
