<script setup lang="ts">
  import { addPX } from '@/api/util';
  import { computed, onMounted, ref, watch, type Component } from 'vue';

  const svg = ref<SVGSVGElement | null>(null);
  const circle = ref<SVGCircleElement | null>(null);
  const circle2 = ref<SVGCircleElement | null>(null);

  const useMD3 = true;

  const props = withDefaults(
    defineProps<{
      value?: number;
      diameter?: number;
      stroke?: number;
    }>(),
    {
      value: Infinity,
      diameter: 48,
      stroke: 5,
    }
  );

  const isInfinite = computed(() => {
    return !isFinite(props.value);
  });

  const circleRadius = computed(() => {
    return (props.diameter - props.stroke) / 2;
  });

  const circleStrokeWidth = computed(() => {
    return addPX(props.stroke);
  });

  const circleCircumference = computed(() => {
    return 2 * Math.PI * circleRadius.value;
  });

  const circleStrokeDashArray = computed(() => {
    return addPX(circleCircumference.value);
  });

  const circleStrokeDashOffset = computed(() => {
    if (!isInfinite.value) {
      return addPX((circleCircumference.value * (100 - props.value)) / 100);
    }

    if (isInfinite) {
      return addPX(circleCircumference.value * 0.2);
    }

    return '';
  });

  const space = computed(() => props.stroke * 2.5);
  const hasSpace = computed(() => {
    return props.value > space.value / 2.5 && props.value < 100 - space.value;
  });

  const circle2StrokeDashOffset = computed(() => {
    const offset = hasSpace.value ? space.value : 0;

    const value = addPX(
      (circleCircumference.value * props.value +
        circleCircumference.value * offset) /
        100
    );
    return value;
  });

  const circle2StrokeRotate = computed(() => {
    const offset = hasSpace.value ? space.value / 2 : 0;
    return (360 * (props.value + offset)) / 100 + 'deg';
  });

  function attachStyles() {
    const svgRoot = svg.value!;
    const circleElem = circle.value!;
    const circle2Elem = circle2.value;

    const size = addPX(props.diameter);
    svgRoot.style.width = size;
    svgRoot.style.height = size;

    circleElem.style.strokeDashoffset = circleStrokeDashOffset.value;
    circleElem.style.strokeDasharray = circleStrokeDashArray.value;
    circleElem.style.strokeWidth = circleStrokeWidth.value;

    if (circle2Elem) {
      circle2Elem.style.strokeWidth = circleStrokeWidth.value;
      circle2Elem.style.strokeDasharray = circleStrokeDashArray.value;
      circle2Elem.style.strokeDashoffset = circle2StrokeDashOffset.value;
      circle2Elem.style.rotate = circle2StrokeRotate.value;
    }

    circleElem.style.setProperty(
      '--md-progress-spinner-start-value',
      String(1 * circleCircumference.value)
    );
    circleElem.style.setProperty(
      '--md-progress-spinner-end-value',
      String(0.2 * circleCircumference.value)
    );
  }

  watch(props, () => attachStyles());
  onMounted(() => attachStyles());
</script>

<template>
  <!-- Credits: Vue Material by Marcos Moura; https://github.com/vuematerial/vue-material -->
  <transition name="md-progress-spinner" appear>
    <div
      class="md-progress-spinner md-progress-spinner-infinite"
      :class="[
        useMD3 ? 'md3' : 'md2',
        'md-' + (isInfinite ? 'infinite' : 'finite'),
      ]"
    >
      <svg
        class="md-progress-spinner-draw"
        preserveAspectRatio="xMidYMid meet"
        focusable="false"
        :viewBox="`0 0 ${diameter} ${diameter}`"
        ref="svg"
      >
        <circle
          class="md-progress-spinner-bg"
          cx="50%"
          cy="50%"
          :r="circleRadius"
          ref="circle2"
          v-if="useMD3 && !isInfinite"
        />

        <circle
          class="md-progress-spinner-circle"
          cx="50%"
          cy="50%"
          :r="circleRadius"
          ref="circle"
        />
      </svg>

      <div
        class="spinner-content"
        :style="{
          width: addPX(diameter - stroke * 2),
          height: addPX(diameter - stroke * 2),
        }"
      >
        <slot />
      </div>
    </div>
  </transition>
</template>

<style lang="scss" scoped>
  @import '@/assets/vars.scss';

  @keyframes md-progress-spinner-rotate {
    0% {
      transform: rotate(0);
    }

    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes md-progress-spinner-initial-rotate {
    0% {
      opacity: 0;
      transform: rotate(-90deg) translateZ(0);
    }

    20% {
      opacity: 1;
    }

    100% {
      transform: rotate(270deg) translateZ(0);
    }
  }

  @keyframes md-progress-spinner-stroke-rotate-fallback {
    0% {
      transform: rotate(0);
    }
    25% {
      transform: rotate(1170deg);
    }
    50% {
      transform: rotate(2340deg);
    }
    75% {
      transform: rotate(3510deg);
    }
    100% {
      transform: rotate(4680deg);
    }
  }

  @keyframes md-progress-spinner-stroke-rotate {
    0% {
      stroke-dashoffset: var(--md-progress-spinner-start-value);
      transform: rotate(0);
    }

    10% {
      stroke-dashoffset: var(--md-progress-spinner-end-value);
      transform: rotate(0);
    }

    10.01% {
      stroke-dashoffset: var(--md-progress-spinner-end-value);
      transform: rotateX(180deg) rotate(70deg);
    }

    20% {
      stroke-dashoffset: var(--md-progress-spinner-start-value);
      transform: rotateX(180deg) rotate(70deg);
    }

    20.01% {
      stroke-dashoffset: var(--md-progress-spinner-start-value);
      transform: rotate(290deg);
    }

    30% {
      stroke-dashoffset: var(--md-progress-spinner-end-value);
      transform: rotate(290deg);
    }

    30.01% {
      stroke-dashoffset: var(--md-progress-spinner-end-value);
      transform: rotateX(180deg) rotate(142deg);
    }

    40% {
      stroke-dashoffset: var(--md-progress-spinner-start-value);

      transform: rotateX(180deg) rotate(142deg);
    }

    40.01% {
      stroke-dashoffset: var(--md-progress-spinner-start-value);
      transform: rotate(216deg);
    }

    50% {
      stroke-dashoffset: var(--md-progress-spinner-end-value);
      transform: rotate(214deg);
    }

    50.01% {
      stroke-dashoffset: var(--md-progress-spinner-end-value);
      transform: rotateX(180deg) rotate(216deg);
    }

    60% {
      stroke-dashoffset: var(--md-progress-spinner-start-value);
      transform: rotateX(180deg) rotate(216deg);
    }

    60.01% {
      stroke-dashoffset: var(--md-progress-spinner-start-value);
      transform: rotate(144deg);
    }

    70% {
      stroke-dashoffset: var(--md-progress-spinner-end-value);
      transform: rotate(144deg);
    }

    70.01% {
      stroke-dashoffset: var(--md-progress-spinner-end-value);

      transform: rotateX(180deg) rotate(286deg);
    }

    80% {
      stroke-dashoffset: var(--md-progress-spinner-start-value);
      transform: rotateX(180deg) rotate(284deg);
    }

    80.01% {
      stroke-dashoffset: var(--md-progress-spinner-start-value);
      transform: rotate(73deg);
    }

    90% {
      stroke-dashoffset: var(--md-progress-spinner-end-value);
      transform: rotate(73deg);
    }

    90.01% {
      stroke-dashoffset: var(--md-progress-spinner-end-value);
      transform: rotateX(180deg) rotate(0deg);
    }

    100% {
      stroke-dashoffset: var(--md-progress-spinner-start-value);
      transform: rotateX(180deg) rotate(0deg);
    }
  }

  .md-progress-spinner {
    display: inline-flex;
    position: relative;
    width: max-content;
    height: max-content;
    align-self: center;

    .spinner-content {
      position: absolute;
      display: grid;
      place-items: center;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      &:empty {
        display: none;
      }
    }

    &.md-infinite {
      animation: md-progress-spinner-rotate 2.5s linear infinite;

      &.md-progress-spinner-enter,
      &.md-progress-spinner-leave-to {
        .md-progress-spinner-draw {
          opacity: 0;
          transform: scale(0.1);
        }
      }

      &.md-progress-spinner-enter-active,
      &.md-progress-spinner-leave-active {
        transition-duration: 0s;
        animation: none;
      }

      .md-progress-spinner-circle {
        animation: 7s infinite $md-transition-stand-timing;
        animation-name: md-progress-spinner-stroke-rotate;
      }
    }

    &.md-finite {
      &.md-progress-spinner-enter-active {
        transition-duration: 2s;

        .md-progress-spinner-draw {
          animation: md-progress-spinner-initial-rotate 1.98s
            $md-transition-stand-timing forwards;
        }
      }

      &.md-progress-spinner-leave-active {
        transition-duration: 2s;

        .md-progress-spinner-draw {
          animation: md-progress-spinner-initial-rotate reverse 1.98s
            $md-transition-stand-timing forwards;
        }
      }

      .md-progress-spinner-draw {
        transition: none;
      }
    }

    &.md3 {
      .md-progress-spinner-circle,
      .md-progress-spinner-bg {
        stroke-linecap: round;
      }
    }
  }

  .md-progress-spinner-draw {
    overflow: visible;
    transform: scale(1) rotate(-90deg);
    transform-origin: center;
    transition: 0.4s $md-transition-stand-timing;
    will-change: opacity, transform;
  }

  .md-progress-spinner-circle {
    fill: none;
    stroke: var(--primary);
    transform-origin: center;
    transition: stroke-dashoffset 0.25s $md-transition-stand-timing;
    will-change: stroke-dashoffset, stroke-dasharray, stroke-width,
      animation-name, r;
  }

  .md-progress-spinner-bg {
    fill: none;
    stroke: var(--mono-20);
    transform-origin: center;
    transition:
      stroke-dashoffset 0.25s $md-transition-stand-timing,
      rotate 0.25s $md-transition-stand-timing;
    will-change: stroke-dashoffset, stroke-dasharray, stroke-width,
      animation-name, r;
  }
</style>
