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

    const offset = clamp(cursorPos + padding - rect.height / 2, 0, rect.width);
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
    :class="{ dragging }"
    :style="{ '--pos': position }"
  >
    <div class="icon" :data-value="model">
      <slot name="icon" />
    </div>
    <div class="slider-content">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .master-slider {
    --height: var(--size-md);
    user-select: none;
    position: relative;
    width: 100%;
    display: grid;
    overflow: hidden;
    gap: var(--xs);
    grid-template-columns: var(--height) 1fr;
    min-height: var(--height);
    background-color: var(--primary-50-50);
    border-radius: calc(var(--height) / 2.25);
    &::before,
    &::after {
      content: '';
      position: absolute;
      background-color: var(--primary-container);
    }

    &::before {
      inset: 0;
      width: calc((var(--pos) * 1%));
      min-width: var(--height);
      height: 100%;
      border-radius: inherit;
    }

    &::after {
      right: calc(var(--height) / 4);
      top: 50%;
      width: calc(var(--height) * 0.1);
      aspect-ratio: 1;
      transform: translateY(-50%);
      border-radius: inherit;
    }

    &.dragging {
      &::before {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }
      .icon {
        > * {
          display: none;
        }
        &::before {
          display: block !important;
          content: attr(data-value);
        }
      }
    }

    .icon {
      width: var(--height);
      height: var(--height);
      display: grid;
      place-items: center;
      z-index: 1;
    }

    .slider-content {
      width: 100%;
      height: 100%;
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      color: var(--primary-80);
    }
  }
</style>
