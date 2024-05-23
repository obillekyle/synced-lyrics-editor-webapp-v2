<script setup lang="ts">
  import {
    clamp,
    evaluate,
    findNearestNumber,
    mapNumberToRange,
  } from '@/api/util';
  import {
    computed,
    onBeforeMount,
    onBeforeUnmount,
    onMounted,
    ref,
    watch,
  } from 'vue';

  const props = withDefaults(
    defineProps<{
      defaultValue?: number;
      values?: number[];
      min?: number;
      max?: number;
      step?: number;
      decimal?: number;
      change?: (value: number) => void;
      showValue?: boolean;
      showLabel?: boolean;
    }>(),
    {
      min: 0,
      max: 100,
      decimal: 0,
    }
  );

  const model = defineModel<number>();
  const wrapper = ref<HTMLElement | null>(null);
  const dragging = ref(false);
  const useMD3 = true;

  const minVal = computed(() =>
    props.values ? Math.min(...props.values) : props.min
  );

  const maxVal = computed(() =>
    props.values ? Math.max(...props.values) : props.max
  );

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
    const offset = clamp(clientX - rect.left, 0, rect.width);

    if (props.values) {
      const min = Math.min(...props.values);
      const max = Math.max(...props.values);
      const value = Math.round((offset / rect.width) * (max - min) + min);
      model.value = findNearestNumber(value, props.values)!;
      return;
    }

    if (props.step) {
      const value = (offset / rect.width) * (maxVal.value - minVal.value);
      model.value = Math.round(value / props.step) * props.step;
      return;
    }

    const value = (offset / rect.width) * (maxVal.value - minVal.value);
    model.value = Math.round(value * 10 ** props.decimal) / 10 ** props.decimal;
  }

  function dragUp(e: MouseEvent | TouchEvent) {
    dragging.value = false;
  }

  onBeforeMount(() => {
    model.value ??= Math.max(
      Math.min(props.defaultValue ?? 0, maxVal.value),
      minVal.value
    );
  });

  function getPosition(value: number) {
    const num = ((value - minVal.value) / (maxVal.value - minVal.value)) * 100;
    return useMD3
      ? mapNumberToRange(num, 0, 100, 1.4, 98.4)
      : mapNumberToRange(num, 0, 100, 0.3, 99.4);
  }

  const thumbPos = computed(() => {
    return getPosition(model.value || 0);
  });

  watch(model, () => {
    evaluate(props.change, model.value);
  });

  onMounted(() => {
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
  <div class="slider" :class="{ md3: useMD3 }">
    <div class="slider-value" v-if="props.showValue">
      {{ model }}
    </div>
    <div
      class="slider-wrapper"
      ref="wrapper"
      @mousedown="dragDown"
      @touchstart="dragDown"
      :style="{
        '--thumb-offset': thumbPos,
      }"
    >
      <div class="slider-thumb" :data-value="model" :dragging />
      <input type="range" :min="minVal" :max="maxVal" v-model="model" />
      <div class="slider-track" />
      <div class="slider-labels" v-if="props.values">
        <div
          class="label"
          v-if="props.showLabel"
          v-for="value in props.values"
          :style="{ '--offset': getPosition(value) }"
        >
          {{ value }}
        </div>
      </div>
      <div class="slider-indicator" v-if="props.values">
        <div
          class="dot"
          v-for="value in props.values"
          :class="{ covered: value <= (model || 0) }"
          :style="{ '--offset': getPosition(value) }"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  .slider {
    --thumb-width: calc(var(--xs) * 1.5);
    --thumb-height: var(--lg);
    --track-height: var(--sm);

    padding-inline: var(--lg);
    height: calc(var(--thumb-height) * 2);
    width: 100%;
    user-select: none;
    display: grid;
    align-items: center;

    input {
      display: none;
    }

    &:has(.slider-value) {
      grid-template-columns: auto 1fr;
    }

    .slider-value {
      font-size: var(--font-sm);
      padding: var(--xs) var(--md);
      margin-right: var(--sm);
      background-color: var(--mono-200);
      color: var(--mono-800);
      border-radius: var(--xs);
    }

    .slider-wrapper {
      position: relative;
      display: flex;
      height: 100%;
      align-items: center;
    }

    .slider-track {
      position: absolute;
      align-self: center;
      left: 0;
      overflow: hidden;
      right: 0;
      height: var(--track-height);
      background: var(--mono-200);
      border-radius: 999px;
      &::before {
        position: absolute;
        content: '';
        height: 100%;
        left: 0;
        right: calc((var(--thumb-offset) - 100) * -1%);
        background: var(--color-600);
      }
    }

    .slider-thumb {
      z-index: 1;
      position: absolute;
      left: calc(var(--thumb-offset) * 1%);
      width: var(--thumb-width);
      height: calc(var(--thumb-height) * 2);
      border-radius: 999px;
      align-self: center;
      transform: translateX(-50%);
      background: var(--color-600);

      &::after {
        content: attr(data-value);
        position: absolute;
        top: 0;
        left: 50%;
        padding: var(--xs) var(--sm);
        background: var(--mono-100);
        transform: translate(-50%, -100%);
        font-size: var(--font-sm);
        color: var(--mono-1000);
        border-radius: var(--xs);
        transition: all 0.2s;
        box-shadow: 0 2px 5px #0005;
        opacity: 0;
      }

      &[dragging='true'] {
        background: var(--color-700);
        &::after {
          transform: translate(-50%, -125%);
          opacity: 1;
        }
      }
    }

    .slider-indicator {
      position: absolute;
      left: 0;
      right: 0;
      width: 100%;
      display: flex;
      align-items: center;
      height: calc(var(--xs) * 2);
      border-radius: 999px;

      .dot {
        left: calc(var(--offset) * 1%);
        transform: translateX(calc(var(--offset) * -0.5%));
        position: absolute;
        width: var(--xs);
        height: var(--xs);
        border-radius: 999px;
        background: var(--color-500);
        &.covered {
          background: var(--color-200);
        }
      }
    }

    .slider-labels {
      position: absolute;
      align-self: center;
      width: 100%;
      height: var(--xs);
      margin-inline: auto;
      pointer-events: none;

      .label {
        position: absolute;
        left: calc(var(--offset) * 1%);
        transform: translateX(calc(var(--offset) * -0.5%));
        font-size: var(--sm);
        color: var(--mono-500);
        padding-top: var(--md);
        width: max-content;
        text-align: center;
      }
    }
    &.md3 {
      --thumb-width: var(--xs);
      --thumb-height: var(--xl);
      --track-height: var(--md);

      height: calc(var(--thumb-height) * 2.5);

      .slider-thumb {
        height: calc(var(--thumb-height) * 2.5);
      }

      .slider-indicator {
        > :last-child {
          scale: 1.5;
          margin-left: 1.1px;
          transform-origin: left;
        }

        .dot {
          background-color: var(--color-700);
          &.covered {
            background-color: var(--color-100);
          }
        }
      }

      .slider-track {
        background: none;

        &::before {
          width: calc((var(--thumb-offset) * 1%) - (var(--thumb-width) * 1.5));
          border-radius: 2px;
        }

        &::after {
          content: '';
          right: 0;
          background-color: var(--color-200);
          height: 100%;
          position: absolute;
          left: calc(((var(--thumb-offset) * 1%) + (var(--thumb-width) * 1.5)));
          border-radius: 2px;
        }
      }
    }
  }
</style>
