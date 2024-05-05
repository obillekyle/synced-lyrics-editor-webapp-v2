<script setup lang="ts">
  import { type HTMLAttributes, provide, ref, type Ref } from 'vue';

  interface NavigationBarProps extends /* @vue-ignore */ HTMLAttributes {
    active: Ref<number>;
  }

  defineProps<NavigationBarProps>();
  const count = ref(0);
  const parent = ref<HTMLDivElement | null>(null);
  const model = defineModel('active', {
    default: 0,
  });

  provide('activeItem', model);
  provide('parent', parent);
  provide('count', count);
</script>
<template>
  <div class="navigation-bar" ref="parent">
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
    background: var(--background-secondary);
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
        width: 48px;
        height: 28px;
        font-size: 24px;
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
          width: 24px;
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
      }
      * {
        pointer-events: none;
      }
    }

    .nav-item:active .icon > * {
      scale: 0.9;
    }

    .nav-item:hover .icon {
      background-color: var(--color-600-20);
    }

    .nav-item.active {
      .name {
        color: var(--color-900);
      }
      .icon {
        color: var(--color-900);
        &::before {
          background-color: var(--color-400);
          width: 48px;
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
      .nav-item {
        margin-bottom: 0;
        .name {
          font-size: var(--font-md);
        }
        .icon {
          font-size: 28px;
          height: 36px;
          width: 56px;
        }
        &.active .icon::before {
          width: 56px;
        }
      }

      .nav-content {
        display: none;
      }
    }
  }
</style>
