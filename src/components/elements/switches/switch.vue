<script setup lang="ts">
  import { type InputHTMLAttributes, ref, onMounted, inject } from 'vue';
  import { addPX, evaluate, getCSSValue, type AppSizes } from '@/api/util';

  interface SwitchProps
    extends /* @vue-ignore */ Omit<InputHTMLAttributes, 'size'> {
    size?: AppSizes | number | String;
    change?: (v: boolean) => any;
    defaultChecked?: boolean;
  }

  const inputRef = ref<HTMLInputElement | null>(null);
  const model = defineModel<boolean | undefined>({
    default: undefined,
  });

  const props = withDefaults(defineProps<SwitchProps>(), {
    size: 'sm',
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
    class="switch-wrapper"
    @click="() => inputRef?.click()"
    :style="`--size: ${getCSSValue(size, 'px', 'size')}`"
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
    width: calc(var(--size) * 1.8);
    height: var(--size);
    border-radius: var(--size);
    background-color: var(--mono-100);
    transition: box-shadow 0.15s ease;
    box-shadow:
      0 0 0 2px var(--mono-500),
      0 0 8px #0005;

    input {
      display: none;
    }

    &:has(input.inverted) {
      background-color: var(--mono-900);
      &::after {
        background-color: var(--mono-500);
      }

      &:has(input:checked) {
        background-color: var(--color-300);
        box-shadow:
          0 0 0 2px var(--color-300),
          0 0 8px #0005;

        &::after {
          background-color: var(--color-800);
        }
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
      background-color: var(--mono-500);
      border-radius: var(--size);
      transition: all 0.15s ease;
    }
  }

  .switch-wrapper:has(input:checked) {
    background-color: var(--color-800);
    box-shadow:
      0 0 0 2px var(--color-800),
      0 0 8px #0005;

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
