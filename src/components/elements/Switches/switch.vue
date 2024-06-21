<script setup lang="ts">
  import { type InputHTMLAttributes, ref, onMounted, inject } from 'vue';
  import {
    addPX,
    evaluate,
    getCSSValue,
    type AppSizes,
    keyboardClick,
  } from '@/api/util';

  interface SwitchProps
    extends /* @vue-ignore */ Omit<InputHTMLAttributes, 'size'> {
    size?: AppSizes | number | String;
    change?: (v: boolean) => any;
    defaultChecked?: boolean;
    variant?: 'outline' | 'filled';
  }

  const inputRef = ref<HTMLInputElement | null>(null);
  const model = defineModel<boolean | undefined>({
    default: undefined,
  });

  const props = withDefaults(defineProps<SwitchProps>(), {
    size: 'md',
    variant: 'outline',
  });

  function handleClick() {
    const element = inputRef.value!;
    if (element.disabled) return;
    model.value = !model.value;
    evaluate(props.change, model.value);
  }

  onMounted(() => {
    model.value ??= props.defaultChecked ?? false;
  });

  defineOptions({
    inheritAttrs: false,
    name: 'Switch',
  });
</script>

<template>
  <div
    tabindex="0"
    class="switch-wrapper"
    :class="variant"
    @keydown="keyboardClick"
    @click="() => inputRef?.click()"
    :style="`--size: ${getCSSValue(size, 'px', 'component')}`"
  >
    <input
      type="checkbox"
      v-bind="$attrs"
      v-model="model"
      ref="inputRef"
      @click="handleClick"
    />
  </div>
</template>

<style lang="scss" scoped>
  .switch-wrapper {
    position: relative;
    display: inline-block;
    width: calc(var(--size) * 2);
    height: var(--size);
    border-radius: var(--size);
    background-color: var(--mono-10);
    transition: box-shadow 0.15s ease;
    box-shadow: 0 0 0 2px var(--mono-50);
    input {
      display: none;
    }

    &.filled {
      box-shadow: 0 0 0 2px var(--mono-10);

      &::after {
        scale: 0.8;
      }
    }

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      scale: 0.6;
      width: var(--size);
      height: var(--size);
      background-color: var(--mono-50);
      border-radius: var(--size);
      transition:
        inset 0.2s var(--timing-standard),
        scale 0.25s var(--timing-standard);
    }
  }

  .switch-wrapper:has(input:checked) {
    background-color: var(--primary);
    box-shadow: 0 0 0 2px var(--primary);

    &::after {
      scale: 0.8;
      left: calc(var(--size) * 1);
      background-color: var(--on-primary);
    }
  }

  .switch-wrapper:has(input:disabled) {
    opacity: 0.5;
  }
</style>
