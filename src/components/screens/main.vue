<script setup lang="ts">
  import { onMounted, onUnmounted, ref } from 'vue';

  import debugScreen from './debug.vue';
  import editScreen from './edit.vue';
  import previewScreen from './lyric.vue';
  import timingScreen from './timing.vue';
  import filesScreen from './files.vue';

  const screen = window.app.screen;
  const options = window.app.options;

  const activeScreen = ref(screen.current || 'timing');

  function screenChange(value: typeof activeScreen.value) {
    activeScreen.value = value;
    options.set('screen', value);
  }

  onMounted(() => {
    screen.addEventListener('update', screenChange);
  });

  onUnmounted(() => {
    screen.removeEventListener('update', screenChange);
  });
</script>

<template>
  <div class="app-main-content">
    <edit-screen v-if="activeScreen == 'edit'" />
    <timing-screen v-if="activeScreen == 'timing'" />
    <preview-screen v-if="activeScreen == 'lyric'" />
    <debug-screen v-if="activeScreen == 'debug'" />
    <files-screen v-if="activeScreen == 'files'" />
  </div>
</template>

<style lang="scss">
  .app-main-content {
    display: grid;
    align-items: center;
    height: 100%;
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
