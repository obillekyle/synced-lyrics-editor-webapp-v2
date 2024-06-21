<script setup lang="ts">
  import { type HTMLAttributes, watch, onBeforeMount } from 'vue';
  import Switch from './switch.vue';
  import { evaluate, keyboardClick, rippleEffect } from '@/api/util';
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
    value.value ??= props.defaultChecked ?? false;
  });

  watch(value, () => {
    evaluate(props.change, value.value);
  });
</script>

<template>
  <div
    class="master-switch"
    tabindex="0"
    v-bind="$attrs"
    @click="() => (value = !value)"
    @pointerdown="rippleEffect"
    @keydown="keyboardClick"
  >
    <div class="label">
      <slot>{{ name }}</slot>
    </div>
    <div class="toggle">
      <Switch
        :modelValue="value"
        :defaultChecked="defaultChecked"
        variant="filled"
      />
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
    overflow: hidden;

    background: var(--primary-container);
    color: var(--on-primary-container);

    padding: var(--padding-xxl) var(--padding-lg);
    border-radius: var(--padding-xxl);
    text-transform: capitalize;
    font-size: var(--font-lg);
    z-index: 10;
    box-shadow: var(--shadow-3);

    .toggle {
      pointer-events: none;
      position: absolute;
      display: grid;
      align-items: center;
      right: var(--padding-lg);
      top: 0;
      bottom: 0;
    }
  }

  .layout:has(.header) {
    .master-switch {
      top: var(--padding-lg);
    }
  }
</style>
