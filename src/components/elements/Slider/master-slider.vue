<script setup lang="ts">
  import {
    clamp,
    evaluate,
    findNearestNumber,
    mapNumberToRange,
  } from '@/api/util';
  import {
    ref,
    type HTMLAttributes,
    onBeforeMount,
    watch,
    onBeforeUnmount,
    onMounted,
    computed,
  } from 'vue';

  interface MasterSliderProps extends /* @vue-ignore */ HTMLAttributes {
    defaultValue?: number;
    min?: number;
    max?: number;
    step?: number;
    decimal?: number;
    change?: (value: number) => void;
  }

  const props = withDefaults(defineProps<MasterSliderProps>(), {
    min: 0,
    max: 100,
    step: 1,
    decimal: 0,
  });

  const model = defineModel<number>();
  const wrapper = ref<HTMLElement | null>(null);
  const dragging = ref(false);
  const position = ref(0);

  function dragDown(e: MouseEvent | TouchEvent) {
    e.preventDefault();
    dragging.value = true;
    dragMove(e);
  }

  function dragMove(e: MouseEvent | TouchEvent) {
    const element = wrapper.value!;

    if (!element) return;
    if (!dragging.value) return;
    const rect = element.getBoundingClientRect();

    e.preventDefault();

    const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
    const cursorPos = clientX - rect.left;

    const padding =
      ((rect.width / 2 - cursorPos) / (rect.width / 2)) * (rect.height / -2);

    const offset = clamp(cursorPos + padding, 0, rect.width);
    const value = (offset / rect.width) * (props.max - props.min);

    model.value = props.step
      ? Math.round(value / props.step) * props.step
      : Math.round(value * 10 ** props.decimal) / 10 ** props.decimal;
  }

  function dragUp(e: MouseEvent | TouchEvent) {
    dragging.value = false;
  }

  onBeforeMount(() => {
    model.value ??= Math.max(
      Math.min(props.defaultValue ?? 0, props.max),
      props.min
    );
  });

  function getPosition() {
    if (!wrapper.value) return 0;
    const rect = wrapper.value.getBoundingClientRect();
    const min = 100 * (rect.height / rect.width);

    const num =
      (((model.value || 0) - props.min) / (props.max - props.min)) * 100;

    return mapNumberToRange(num, 0, 100, min, 100);
  }

  watch(model, () => {
    evaluate(props.change, model.value);
    position.value = getPosition();
  });

  onMounted(() => {
    const observer = new ResizeObserver(() => {
      position.value = getPosition();
    });
    observer.observe(wrapper.value!);

    document.addEventListener('mousemove', dragMove);
    document.addEventListener('mouseup', dragUp);

    document.addEventListener('touchmove', dragMove);
    document.addEventListener('touchend', dragUp);
  });

  onBeforeUnmount(() => {
    document.removeEventListener('mousemove', dragMove);
    document.removeEventListener('mouseup', dragUp);

    document.removeEventListener('touchmove', dragMove);
    document.removeEventListener('touchend', dragUp);
  });
</script>

<template>
  <div
    class="master-slider"
    ref="wrapper"
    @mousedown="dragDown"
    @touchstart="dragDown"
    :style="{ '--pos': position }"
  >
    <div class="slider-content">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .master-slider {
    user-select: none;
    position: relative;
    width: 100%;
    display: grid;
    min-height: var(--size-xl);
    background-color: var(--color-600-40);
    border-radius: 999px;
    &::before,
    &::after {
      content: '';
      position: absolute;
      background-color: var(--color-600-90);
    }

    &::before {
      inset: 0;
      width: calc((var(--pos) * 1%));
      min-width: var(--size-xl);
      height: 100%;
      border-radius: inherit;
    }

    &::after {
      right: calc(var(--size-xl) / 4);
      top: 50%;
      width: calc(var(--size-xl) * 0.1);
      aspect-ratio: 1;
      transform: translateY(-50%);
      border-radius: inherit;
    }

    .slider-content {
      width: 100%;
      height: 100%;
      position: relative;
      z-index: 1;
      display: flex;
      gap: var(--md);
      align-items: center;
      padding-inline: calc(var(--size-xl) / 2);
      color: white;
      text-shadow: 0 0 4px #0008;
      font-weight: 600;
    }
  }
</style>
