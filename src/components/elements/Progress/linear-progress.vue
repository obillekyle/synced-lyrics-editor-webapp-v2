<script setup lang="ts">
  import { getCSSValue } from '@/api/util';
  import { computed } from 'vue';

  const useMD3 = true;

  const props = withDefaults(
    defineProps<{
      value?: number;
      size?: number | string;
    }>(),
    {
      value: Infinity,
      size: 4,
    }
  );

  const noSpace = computed(() => {
    return props.value < 1;
  });
</script>

<template>
  <div
    class="progress"
    :class="{ md3: useMD3, noSpace }"
    :style="{ height: getCSSValue(size) }"
  >
    <div class="progress-infinite" v-if="value === Infinity" />
    <div class="progress-bar" v-else :style="`--value: ${value}`" />
  </div>
</template>

<style lang="scss" scoped>
  @import '@/assets/vars.scss';

  .progress {
    position: relative;
    background: var(--mono-10);
    border-radius: var(--md);
    overflow: hidden;
    width: 100%;

    .progress-bar {
      height: inherit;
      background: var(--primary);
      overflow: hidden;
      width: calc(var(--value) * 1%);
      transition: width 0.25s $md-transition-stand-timing;
      will-change: width;
      &::before {
        transition: left 0.25s $md-transition-stand-timing;
        will-change: left;
      }
    }

    .progress-infinite {
      height: inherit;
      overflow: hidden;
      position: relative;
      &::before,
      &::after {
        position: absolute;
        content: '';
        top: 0;
        bottom: 0;
        height: inherit;
        background: var(--primary);
        will-change: width, left, opacity;
      }

      &::before {
        animation: infiniteLoad infinite 2.5s linear;
        @keyframes infiniteLoad {
          0% {
            left: -20%;
            width: 20%;
          }
          25% {
            left: 0%;
          }

          50% {
            width: 100%;
            left: 40%;
          }

          80% {
            width: 70%;
            left: 100%;
            opacity: 1;
          }
          80.01% {
            opacity: 0;
          }
          80.02% {
            left: -20%;
            width: 20%;
          }
        }
      }

      &::after {
        animation: infiniteLoad2 infinite 2.5s linear;
        @keyframes infiniteLoad2 {
          0% {
            left: -100%;
            width: 20%;
          }
          66% {
            width: 50%;
            left: -50%;
            opacity: 0;
          }
          67% {
            opacity: 1;
          }
          90% {
            width: 45%;
          }
          100% {
            left: 100%;
            width: 40%;
          }
        }
      }
    }

    &.md3 {
      background-color: transparent;
      border-radius: var(--md);

      &.noSpace {
        .progress-bar::before {
          left: 0;
        }
      }

      .progress-bar {
        border-radius: inherit;

        &::before,
        &::after {
          position: absolute;
          border-radius: inherit;
          content: '';
          top: 0;
          right: 0;
          height: inherit;
        }

        &::before {
          background: var(--primary-20);
          left: calc(var(--value) * 1% + var(--xxs));
        }

        &::after {
          aspect-ratio: 1;
          background: var(--primary);
        }
      }

      .progress-infinite {
        border-radius: inherit;
        &::before,
        &::after {
          border-radius: inherit;
        }
      }
    }
  }
</style>
