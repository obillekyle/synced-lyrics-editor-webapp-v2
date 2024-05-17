<script setup lang="ts">
  import {
    type HTMLAttributes,
    watch,
    onBeforeMount,
  } from 'vue';
  import Switch from './switch.vue';
  import { evaluate } from '@/api/util';
  interface MasterSwitchProps extends /* @vue-ignore */ HTMLAttributes {
    name?: string;
    defaultChecked?: boolean;
    change?: (value: boolean) => void;
  }

  const props = defineProps<MasterSwitchProps>();
  const value = defineModel<boolean>({
    default: undefined,
  });

  defineOptions({
    name: 'MasterSwitch',
    inheritAttrs: false,
  });

  onBeforeMount(() => {
    console.log(props.defaultChecked, value.value);
    value.value ??= props.defaultChecked ?? false;
  });

  watch(value, () => {
    evaluate(props.change, value.value);
  });
</script>

<template>
  <div class="master-switch" v-bind="$attrs" @click="() => (value = !value)">
    <div class="label">
      <slot>{{ name }}</slot>
    </div>
    <div class="toggle">
      <Switch :modelValue="value" :defaultChecked="defaultChecked" />
    </div>
  </div>
</template>

<style lang="scss">
  .master-switch {
    position: sticky;
    top: 0;
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    background: var(--color-300);
    padding: var(--xl) var(--lg);
    border-radius: var(--xl);
    color: var(--color-1000);
    text-transform: capitalize;
    box-shadow: 0 4px 8px #0005;
    z-index: 100;

    .toggle {
      pointer-events: none;
      position: absolute;
      display: grid;
      align-items: center;
      right: var(--lg);
      top: 0;
      bottom: 0;
    }
  }
</style>
