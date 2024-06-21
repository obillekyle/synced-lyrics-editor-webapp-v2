<script setup lang="ts">
  import {
    ref,
    type Component,
    type HTMLAttributes,
    computed,
    watch,
    onMounted,
  } from 'vue';
  import OptionItem from './option-item.vue';
  import { Icon } from '@iconify/vue/dist/iconify.js';
  import { $, keyboardClick, rippleEffect } from '@/api/util';

  export type SelectItem = {
    readonly id: string | number;
    readonly name: string;
    [key: string]: any;
  };

  interface SelectProps extends /* @vue-ignore */ HTMLAttributes {
    value?: number[];
    items?: SelectItem[] | string[];
    optionComp?: Component;
    searchByKey?: string[];
    multiple?: boolean;
    required?: boolean;
    placeholder?: string;
    change?: (value: number[]) => void;
  }

  const values = computed(() => {
    return props.items.map((item) => {
      return typeof item === 'object'
        ? item
        : {
            id: item,
            name: item,
          };
    });
  });

  const show = ref(false);
  const search = ref('');
  const select = ref<HTMLElement | null>(null);
  const props = withDefaults(defineProps<SelectProps>(), {
    optionComp: OptionItem,
    searchByKey: () => [],
    multiple: false,
    required: false,
    items: () => [],
    value: () => [],
  });

  const modelValue = defineModel<number[]>();

  const items = computed(() => {
    return values.value.filter(
      (item) =>
        item.id.toString().toLowerCase().includes(search.value.toLowerCase()) ||
        props.searchByKey.some((key) =>
          item.props[key]!.toString()
            .toLowerCase()
            .includes(search.value.toLowerCase())
        )
    );
  });

  defineExpose({ items });

  const toggle = () => (show.value = !show.value);
  const val = computed(() => modelValue.value || props.value);
  function handleClick(index?: number) {
    if (index === undefined) {
      if (props.multiple) return;
      if (props.required) return;
      if (modelValue.value) modelValue.value = [];
      props.change?.([]);
      return;
    }

    if (modelValue.value) {
      if (props.multiple) {
        if (modelValue.value.includes(index)) {
          modelValue.value = modelValue.value.filter((i) => i !== index);
        } else {
          modelValue.value = [...modelValue.value, index];
        }
      } else {
        modelValue.value = [index];
      }
    }

    if (props.multiple) {
      val.value.includes(index)
        ? props.change?.(val.value.filter((i) => i !== index))
        : props.change?.([...val.value, index]);
    } else {
      props.change?.([index]);
    }
  }

  watch(show, (show) => {
    if (show && select.value) {
      $('.select-dropdown .item-wrapper', select.value)?.focus();
    }
  });

  function closeIfClickOutside(event: MouseEvent) {
    if (show.value && !select.value?.contains(event.target as Node)) {
      show.value = false;
    }
  }

  onMounted(() => {
    if (props.value) handleClick(props.value[0]);

    document.addEventListener('click', closeIfClickOutside);
  });
</script>

<template>
  <div class="select" :class="{ open: show }" ref="select">
    <div
      tabindex="0"
      class="select-wrapper"
      @click="toggle"
      @pointerdown="rippleEffect"
      @keydown="keyboardClick"
    >
      <div
        class="select-single"
        v-if="value?.length === 1 && !multiple && items[value[0]]"
      >
        <div class="item-wrapper">
          <component :is="optionComp" v-bind="items[value[0]]" />
        </div>
      </div>

      <div class="select-single" v-if="value?.length === 0 && !multiple">
        <div class="placeholder">{{ placeholder }}</div>
      </div>

      <div class="select-multi" v-if="multiple">
        <input
          v-model="search"
          type="text"
          class="search"
          placeholder="Search..."
        />
      </div>
      <div class="icon">
        <Icon icon="mdi:chevron-down" :width="24" />
      </div>
    </div>

    <div class="select-dropdown" @click="toggle">
      <div
        tabindex="0"
        class="item-wrapper empty"
        v-if="!required && !multiple"
        @click="() => handleClick()"
        @pointerdown="rippleEffect"
        :class="{ active: val.length === 0 }"
      />
      <div
        tabindex="0"
        class="item-wrapper"
        v-for="(item, index) in items"
        :key="index"
        :data-index="index"
        @pointerdown="rippleEffect"
        @click="() => handleClick(index)"
        :class="{ active: val.includes(index) }"
      >
        <component :is="optionComp" v-bind="item" />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  .select {
    position: relative;
    --size: var(--size-md);

    .select-wrapper {
      display: grid;
      grid-template-columns: 1fr 48px;
      align-items: center;
      height: var(--size);
      position: relative;
      overflow: hidden;

      border-radius: var(--xs);
      border: 1px solid var(--primary-60-30);

      &:empty::after {
        content: 'No item selected';
        display: block;
        text-align: center;
        font-size: var(--font-lg);
      }

      .icon {
        line-height: 0;
        place-self: center;
        transition: transform 0.25s var(--timing-standard);
      }

      .placeholder {
        font-size: var(--font-lg);
        padding-inline: var(--lg);
        color: var(--mono-60);
      }
    }

    .select-dropdown {
      position: absolute;
      top: var(--size);
      left: 0;
      width: 100%;
      background: var(--primary-10);
      border: 1px solid var(--primary-60-30);
      border-radius: 0 0 var(--xs) var(--xs);
      border-top: none;
      overflow: auto;
      pointer-events: none;
      min-height: var(--size);
      max-height: calc(var(--size) * 3.1);
      opacity: 0;
      transform: scaleY(0.9);
      z-index: 5;
      transform-origin: top;
      transition:
        opacity 0.25s var(--timing-standard),
        transform 0.25s var(--timing-standard);
    }
    .item-wrapper {
      display: grid;
      align-content: center;

      position: relative;
      overflow: hidden;

      height: var(--size);
      border-bottom: 1px solid var(--primary-60-10);
      cursor: pointer;

      &.active {
        background: var(--primary-60-10);
      }

      &:last-child {
        border-bottom: none;
      }
    }

    &.open {
      .select-wrapper {
        border-bottom-left-radius: 0px;
        border-bottom-right-radius: 0px;
        > .icon {
          transform: rotate(180deg);
          transform-origin: center;
        }
      }

      .select-dropdown {
        opacity: 1;
        pointer-events: initial;
        transform: scaleY(1);
      }
    }
  }
</style>
