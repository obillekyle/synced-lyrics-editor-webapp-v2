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
    width: var(--size-xl, 88px);
    background: var(--primary-10);

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
      color: var(--primary-80);
      padding-block: var(--padding-xs);
      margin-bottom: var(--padding-xs);
      .icon {
        align-self: end;
        margin-bottom: 4px;
        border-radius: 999px;
        display: grid;
        position: relative;
        overflow: hidden;
        justify-self: center;
        place-items: center;
        width: var(--size-sm);
        height: var(--icon-lg);
        font-size: var(--icon-md);
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
          width: var(--icon-lg);
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
      background-color: var(--primary-40-20);
    }

    .nav-item.active {
      .name {
        color: var(--primary-90);
      }
      .icon {
        color: var(--on-primary-container);
        &::before {
          background-color: var(--primary-container);
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
        transform: translateY(20%);
      }

      &.hidden .nav-item.active,
      &.active .nav-item.active {
        .name {
          opacity: 1;
          transform: translateY(-25%);
        }
        .icon {
          transform: translateY(-15%);
        }
      }

      .nav-item {
        margin-bottom: 0;
        padding-top: var(--padding-sm);
        .name {
          font-size: var(--font-md);
        }
        .icon {
          height: var(--icon-xl);
          width: var(--size-md);
          transition: transform 0.25s var(--timing-standard);
        }

        &.active {
          .icon::before {
            width: var(--size-md);
          }
        }
      }

      .nav-content {
        display: none;
      }
    }
  }
</style>
