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
      values?: number[] | { label: string; value: number }[];
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

  const minVal = computed(() => {
    if (props.values) {
      const array = props.values.map((value) =>
        typeof value === 'object' ? value.value : value
      );
      return Math.min(...array);
    }
    return props.min;
  });

  const values = computed(() => {
    if (props.values) {
      return props.values
        .map((value) => (typeof value === 'object' ? value.value : value))
        .sort((a, b) => a - b);
    }

    return [];
  });

  const maxVal = computed(() => {
    if (props.values) {
      const array = props.values.map((value) =>
        typeof value === 'object' ? value.value : value
      );
      return Math.max(...array);
    }
    return props.max;
  });

  function dragDown(e: MouseEvent | TouchEvent) {
    e.preventDefault();
    dragging.value = true;
    dragMove(e);
  }

  function getLabel(value: number) {
    if (props.values) {
      const index = props.values.find(
        (v) => typeof v === 'object' && v.value === value
      );
      return typeof index === 'number' ? index : index?.label || value;
    }

    return value;
  }

  function dragMove(e: MouseEvent | TouchEvent) {
    const element = wrapper.value!;

    if (!element) return;
    if (!dragging.value) return;
    const rect = element.getBoundingClientRect();

    e.preventDefault();

    const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
    const offset = clamp(clientX - rect.left, 0, rect.width);

    const maxOffset = maxVal.value - minVal.value;

    if (props.values) {
      const min = minVal.value;
      const max = maxVal.value;
      const value = Math.round((offset / rect.width) * (max - min) + min);
      model.value = findNearestNumber(value, values.value)!;
      return;
    }

    if (props.step) {
      const value = (offset / rect.width) * maxOffset;
      const rounded = Math.round(value / props.step) * props.step;
      model.value = Math.max(rounded, minVal.value);
      return;
    }

    const value = (offset / rect.width) * maxOffset;
    const rounded =
      Math.round(value * 10 ** props.decimal) / 10 ** props.decimal;
    model.value = Math.max(rounded + minVal.value, minVal.value);
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
      ? mapNumberToRange(num, 0, 100, 2.4, 97.6)
      : mapNumberToRange(num, 0, 100, 0.3, 99.4);
  }

  const thumbPos = computed(() => {
    return getPosition(model.value ?? 0);
  });

  watch(model, () => {
    evaluate(props.change, model.value);
  });

  function handleKeydown(e: KeyboardEvent) {
    const step = props.step ?? 1 / 10 ** props.decimal;
    if (e.key === 'ArrowLeft') {
      if (props.values) {
        const index = values.value.findIndex((v) => v === model.value);
        const nextIndex = Math.max(index - 1, 0);
        model.value = values.value[nextIndex];
        return;
      }

      const value = (model.value ?? minVal.value) - step;
      model.value = Math.max(value, minVal.value);
    } else if (e.key === 'ArrowRight') {
      if (props.values) {
        const index = values.value.findIndex((v) => v === model.value);
        const nextIndex = Math.min(index + 1, values.value.length - 1);
        model.value = values.value[nextIndex];
        return;
      }

      const value = (model.value ?? minVal.value) + step;
      model.value = Math.min(value, maxVal.value);
    }
  }

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
  <div
    tabindex="0"
    class="slider"
    :class="{ md3: useMD3 }"
    @keydown="handleKeydown"
    @mousedown="dragDown"
    @dblclick="dragMove"
  >
    <div class="slider-value" v-if="props.showValue">
      {{ model }}
    </div>
    <div
      ref="wrapper"
      class="slider-wrapper"
      :style="{ '--thumb-offset': thumbPos }"
    >
      <div
        class="slider-thumb"
        :data-value="getLabel(model!)"
        :dragging
        @touchstart="dragDown"
      />
      <input type="range" :min="minVal" :max="maxVal" v-model="model" />
      <div class="slider-track" />
      <div class="slider-labels" v-if="props.values">
        <div
          class="label"
          v-if="props.showLabel"
          v-for="value in values"
          :style="{ '--offset': getPosition(value) }"
        >
          {{ getLabel(value) }}
        </div>
      </div>
      <div class="slider-indicator" v-if="props.values">
        <div
          class="dot"
          v-for="value in values"
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
      background-color: var(--mono-20);
      color: var(--mono-80);
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
      background: var(--mono-20);
      border-radius: 999px;
      &::before {
        left: 0;
        position: absolute;
        content: '';
        height: 100%;
        right: calc((var(--thumb-offset) - 100) * -1%);
        background: var(--primary);
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
      background: var(--primary);

      &::after {
        content: attr(data-value);
        position: absolute;
        top: 0;
        left: 50%;
        padding: var(--xs) var(--sm);
        background: var(--mono-10);
        transform: translate(-50%, -100%);
        font-size: var(--font-sm);
        color: var(--mono-100);
        border-radius: var(--xs);
        transition: all 0.2s;
        box-shadow: 0 2px 5px #0005;
        opacity: 0;
      }

      &[dragging='true'] {
        background: var(--primary-40);
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
        transform: translateX(-50%);
        position: absolute;
        width: var(--xxs);
        height: var(--xxs);
        border-radius: 999px;
        background: var(--primary-50);
        &.covered {
          background: var(--primary-20);
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
        transform: translateX(-50%);
        font-size: var(--font-xxs);
        color: var(--mono-50);
        padding-top: var(--md);
        width: max-content;
        text-align: center;
      }
    }
    &.md3 {
      --thumb-width: calc(var(--padding-xxs) * 1.5);
      --thumb-height: var(--component-xl);
      --track-height: var(--component-xs);

      height: var(--thumb-height);

      .slider-thumb {
        height: var(--thumb-height);
      }

      .slider-indicator {
        > :last-child {
          scale: 1.5;
          transform-origin: left;
        }

        .dot {
          background-color: var(--primary-60);
          &.covered {
            background-color: var(--primary-10);
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
          background: var(--primary-20);
          height: 100%;
          position: absolute;
          left: calc(((var(--thumb-offset) * 1%) + (var(--thumb-width) * 1.5)));
          border-radius: 2px;
        }
      }
    }
  }
</style>
