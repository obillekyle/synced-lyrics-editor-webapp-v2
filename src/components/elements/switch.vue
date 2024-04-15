<script setup lang="ts">
  import { ref, type InputHTMLAttributes } from 'vue';
  import { addPX, evaluate } from '@/api/util';
  import { as } from '../keybinds/keys';

  interface SwitchProps extends /* @vue-ignore */ InputHTMLAttributes {
    size?: number | string;
    change?: (v: boolean) => any;
  }

  const inputRef = ref<HTMLInputElement | null>(null);

  withDefaults(defineProps<SwitchProps>(), {
    size: 24,
  });

  defineOptions({
    inheritAttrs: false,
    name: 'Switch',
  });
</script>

<template>
  <div
    class="switch-wrapper"
    @click="
      (e) => {
        e.stopPropagation();
        inputRef?.click();
      }
    "
    :style="`--size: ${addPX(size)}`"
  >
    <input
      type="checkbox"
      v-bind="$attrs"
      ref="inputRef"
      @change="
        (e) => evaluate(change, as<HTMLInputElement>(e.currentTarget)?.checked)
      "
    />
  </div>
</template>

<style lang="scss">
  .switch-wrapper {
    position: relative;
    display: inline-block;
    width: calc(var(--size) * 1.8);
    height: var(--size);
    border-radius: var(--size);
    background-color: var(--color-600-10);
    box-shadow: 0 0 0 2px var(--color-600-50);

    input {
      display: none;
    }
  }

  .switch-wrapper::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    scale: 0.6;
    width: var(--size);
    height: var(--size);
    background-color: var(--color-600-50);
    border-radius: var(--size);
    transition: all 0.15s ease;
  }

  .switch-wrapper:has(input:checked) {
    background-color: var(--color-900);
    box-shadow: 0 0 0 2px var(--color-900);

    &::after {
      scale: 0.85;
      left: calc(var(--size) * 0.8);
      background-color: var(--color-300);
    }
  }

  .switch-wrapper:has(input:disabled) {
    opacity: 0.5;
  }
</style>
