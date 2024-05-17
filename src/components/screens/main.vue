<script setup lang="ts">
  import { onMounted, onUnmounted, ref } from 'vue';

  import debugScreen from './debug.vue';
  import editScreen from './edit.vue';
  import previewScreen from './lyric.vue';
  import timingScreen from './timing.vue';

  const screen = window.app.screen;
  const options = window.app.options;

  const activeScreen = ref(screen.current || 'timing');

  function screenChange(value: typeof activeScreen.value) {
    activeScreen.value = value;
    options.set('screen', value);
  }

  onMounted(() => {
    screen.addEventListener('screenchange', screenChange);
  });

  onUnmounted(() => {
    screen.removeEventListener('screenchange', screenChange);
  });
</script>

<template>
  <div class="app-main-content">
    <edit-screen v-if="activeScreen == 'edit'" />
    <timing-screen v-if="activeScreen == 'timing'" />
    <preview-screen v-if="activeScreen == 'lyric'" />
    <debug-screen v-if="activeScreen == 'debug'" />
  </div>
</template>

<style lang="scss">
  .app-main-content {
    padding-block: 40dvh;
    > * {
      transform: translateY(48px);
      animation: slide-up 0.15s forwards;
    }

    @keyframes slide-up {
      100% {
        transform: translateY(0);
      }
    }

    &:has(.edit-screen, .debug-screen) {
      padding-block: 0;
      padding: var(--md);
    }
  }
</style>
