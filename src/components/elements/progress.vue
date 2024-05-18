<script setup lang="ts">
  import { getCSSValue } from '@/api/util';

  withDefaults(
    defineProps<{
      value: number;
      size?: number | string;
    }>(),
    {
      value: Infinity,
      size: 6,
    }
  );
</script>

<template>
  <div class="progress" :style="{ height: getCSSValue(size) }">
    <div class="progress-infinite" v-if="value === Infinity" />
    <div class="progress-bar" v-else :style="`width: ${value}%`" />
  </div>
</template>

<style lang="scss" scoped>
  .progress {
    position: relative;
    width: 100%;
    background: var(--mono-100);

    .progress-bar {
      height: inherit;
      background: var(--color-700);
      transition: width 0.2s;
      overflow: hidden;
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
        background: var(--color-700);
      }

      &::before {
        animation: infiniteLoad infinite 2s linear;
        @keyframes infiniteLoad {
          0% {
            left: -20%;
            width: 20%;
          }
          25% {
            left: 0%;
          }

          75% {
            width: 175%;
            left: 120%;
            opacity: 1;
          }
          76% {
            opacity: 0;
          }
          77% {
            width: 40%;
            opacity: 0;
          }
          80% {
            left: -20%;
            width: 20%;
          }
        }
      }

      &::after {
        animation: infiniteLoad2 infinite 2s linear;
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
  }
</style>
