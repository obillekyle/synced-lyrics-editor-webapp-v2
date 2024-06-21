<script setup lang="ts">
  import type { PartialDeep } from 'type-fest';
  import type { LayoutOptions } from './util';
  import ScrollContainer from './scroll-container.vue';
  import LayoutStyles from './layout-styles.vue';
  import deep from 'deepmerge';
  import { provide, type HTMLAttributes, computed, ref } from 'vue';
  import { getUnique } from '@/api/util';
  import { DefaultSizes } from './util';
  import './style.scss';
  import Color from 'color';
  import { DefaultLayoutOptions } from './util';

  interface LayoutProps extends /** @vue-ignore */ HTMLAttributes {
    options?: PartialDeep<LayoutOptions>;
  }
  const props = defineProps<LayoutProps>();
  const options = computed<LayoutOptions>(() => {
    const opts = props.options || {};
    const options = DefaultLayoutOptions;

    const primary = opts.color?.primary || options.color.primary;
    const secondary = opts.color?.secondary || Color(primary).rotate(180).hex();

    const propsOptions = deep(opts, { color: { primary, secondary } });
    return deep(options, propsOptions) as LayoutOptions;
  });

  const contentScrollTop = ref(0);
  const id = getUnique('layout');
  const headerTitle = ref('');

  provide('layout-id', id);
  provide('options', options);
  provide('content-scroll-top', contentScrollTop);
  provide('header-title', headerTitle);
</script>

<template>
  <div class="layout" :class="[options.theme]" :id="id">
    <LayoutStyles />
    <slot name="navbar" />
    <slot name="sidebar" />
    <slot name="header" />
    <div class="content">
      <slot name="fab" />
      <ScrollContainer :scroll-change="({ y }) => (contentScrollTop = y)">
        <slot />
      </ScrollContainer>
    </div>
  </div>
</template>

<style lang="scss">
  .layout {
    --background-body: var(--primary-5, #111);
    --background-secondary: var(--primary-10, #333);

    &.light {
      --background-body: var(--primary-1, #fff);
    }

    position: absolute;
    color: var(--mono-80);
    background: var(--background-body);
    inset: 0 0 0 0;

    .content {
      position: absolute;
      inset: 0 0 0 0;
    }

    &:has(.navigation-bar) {
      .content {
        left: var(--navbar-size);
      }
      .header {
        left: var(--navbar-size);
      }
    }

    &:has(.header) {
      .content .scroll-container {
        padding-top: var(--header-size);
      }
    }
  }
</style>
