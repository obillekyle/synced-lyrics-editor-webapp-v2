<script setup lang="ts">
  import { provide } from 'vue';
  import { addPX } from '@/api/util';
  import ListItem from './list-item.vue';
  import type { ListItemType, ListProps } from './types';

  const props = withDefaults(defineProps<ListProps>(), {
    swipe: 'off',
    listComp: 'div',
  });

  const items = defineModel<ListItemType[]>({
    default: [],
  });

  provide('items', items);
  provide('parentProps', props);
</script>

<template>
  <div class="list" :style="{ height: addPX((items.length + 1) * 56) }">
    <ListItem
      v-for="(item, index) in items"
      :key="item.id"
      :index="index"
      :props="item.props"
    />
  </div>
</template>

<style lang="scss">
  .list {
    position: relative;
    display: block;
    width: 100%;
    overflow: hidden;

    .list-item {
      width: 100%;
      display: flex;
      background: var(--background-secondary);
      position: absolute;
      transition: top 0.1s;
      user-select: none;
      height: 56px;
    }

    .list-content {
      position: absolute;
      width: 100%;
      display: flex;
      height: inherit;
      background: inherit;
      transition: left 0.1s;
      z-index: 2;

      .draggable {
        position: absolute;
        right: 0px;
        height: 56px;
        width: 56px;
        display: grid;
        place-items: center;
        cursor: row-resize;

        > * {
          pointer-events: none;
        }
      }
    }

    .swipe-indicator {
      position: absolute;
      z-index: 1;
      inset: 0 0 0 0;

      .left,
      .right {
        display: grid;
        height: inherit;
        inset: 0 0 0 0;
        position: absolute;
        align-items: center;
        padding: var(--md);
      }

      .left {
        grid-area: left;
      }

      .right {
        justify-content: end;
        grid-area: right;
      }
    }
  }
</style>
