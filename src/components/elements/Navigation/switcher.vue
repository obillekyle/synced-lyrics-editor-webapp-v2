<script setup lang="ts">
  import { evaluate } from '@/api/util';
  import { onMounted, ref, type HTMLAttributes } from 'vue';
  import { Icon } from '@iconify/vue';

  interface SwitcherProps extends /* @vue-ignore */ HTMLAttributes {
    change?: (value: number, oldValue: number) => void;
    defaultValue?: number;
    width?: number;
    items: {
      icon: string;
      name: string;
    }[];
  }

  const maxChars = ref(0);
  const props = defineProps<SwitcherProps>();
  const value = defineModel<number>();

  onMounted(() => {
    value.value ??= props.defaultValue ?? 0;

    props.items.forEach((item) => {
      if (item.name.length > maxChars.value) {
        maxChars.value = item.name.length;
      }
    });
  });

  defineOptions({
    inheritAttrs: false,
    name: 'Switcher',
  });

  function handleClick(index: number) {
    evaluate(props.change, index, value.value);

    value.value = index;
  }
</script>

<template>
  <div class="switcher" v-bind="$attrs" :style="{ '--chars': maxChars + 2 }">
    <div
      :class="['item', index == value && 'active']"
      v-for="(item, index) in items"
      @click="() => handleClick(index)"
      :key="index"
    >
      <div class="icon">
        <icon :icon="item.icon" :width="24" />
      </div>
      <div class="name">{{ item.name }}</div>
    </div>
  </div>
</template>

<style lang="scss">
  .switcher {
    display: flex;
    align-items: center;
    padding: calc(var(--sm) / 2);
    background: var(--primary-80-20);
    border-radius: var(--sm);
    margin-block: auto;

    .item {
      overflow: hidden;
      height: 36px;
      display: grid;
      padding-inline: var(--sm);
      border-radius: 4px;
      align-items: center;
      justify-items: center;
      transition: background-color 0.2s;
      grid-template-columns: 36px auto;
      color: var(--primary-90);

      .icon {
        display: grid;
        place-items: center;
        width: 36px;
      }

      .name {
        font-size: var(--font-md);
        text-transform: uppercase;
        transition: width 0.2s;
        font-weight: 600;
        opacity: 0;
        width: 0ch;
        text-align: center;
        justify-self: center;
      }

      * {
        pointer-events: none;
      }
      &.active {
        .name {
          opacity: 1;
          width: calc(var(--chars) * 1ch);
        }
        background: var(--primary-40);
      }
    }
  }
</style>
