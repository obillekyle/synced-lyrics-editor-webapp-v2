<script setup lang="ts">
  import { addPX } from '@/api/util';

  withDefaults(
    defineProps<{
      size?: number | string;
    }>(),
    {
      size: 24,
    }
  );
</script>

<template>
  <div class="playing-indicator" :style="`--size: ${addPX(size)}`">
    <div></div>
    <div></div>
    <div></div>
  </div>
</template>

<style>
  .playing-indicator {
    min-height: var(--size);
    display: flex;
    margin-inline: auto;
    width: calc(var(--size) * 1.5);
    justify-content: space-between;
    div {
      min-width: 25%;
      min-height: 90%;
      background: currentColor;
    }
  }

  .playing-indicator div {
    --speed: 0.5s;
    transform-origin: bottom;
    animation-duration: var(--speed);
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    animation-direction: alternate-reverse;
    animation-name: playing-indicator;
    &:nth-child(2) {
      animation-duration: calc(var(--speed) * 0.8);
      animation-delay: 0.2s;
    }
    &:nth-child(3) {
      animation-duration: calc(var(--speed) * 0.7);
      animation-delay: 0.4s;
    }
  }

  @keyframes playing-indicator {
    0% {
      transform: scaleY(10%);
    }
    100% {
      transform: scaleY(100%);
    }
  }
</style>
