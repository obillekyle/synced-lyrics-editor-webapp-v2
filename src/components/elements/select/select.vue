<script setup lang="ts">
  import {
    ref,
    type Component,
    type HTMLAttributes,
    computed,
    onMounted,
  } from 'vue';
  import OptionItem from './option-item.vue';

  type SelectItem = {
    readonly name?: string;
    [key: string]: any;
  };

  interface SelectProps extends /* @vue-ignore */ HTMLAttributes {
    value?: number[];
    items?: Record<string, any>[];
    optionComp?: Component;
    searchByKey?: string[];
    multiple?: boolean;
    required?: boolean;
    change?: (value: number[]) => void;
  }

  const search = ref('');
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
    return props.items.filter(
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

  const val = computed(() => modelValue.value || props.value);
  function handleClick(index: number) {
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
</script>

<template>
  <div class="select">
    <div class="select-wrapper">
      <input
        v-model="search"
        type="text"
        class="search"
        placeholder="Search..."
      />
      <div
        class="selected-single"
        v-if="value?.length === 1 && !multiple && items[value[0]]"
      >
        <div class="item-wrapper">
          <component :is="optionComp" v-bind="items[value[0]].props" />
        </div>
      </div>
    </div>

    <div
      class="select-dropdown"
      v-for="(item, index) in items"
      :key="index"
      :data-index="index"
    >
      <div
        class="item-wrapper"
        @click="() => handleClick(index)"
        :class="{ active: val.includes(index) }"
      >
        <component :is="optionComp" v-bind="item.props" />
      </div>
    </div>
  </div>
</template>
