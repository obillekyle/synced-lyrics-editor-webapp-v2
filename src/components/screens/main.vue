<script setup lang="ts">
  import { onMounted, onUnmounted, ref } from 'vue';

  import homeScreen from './home.vue';
  import editScreen from './edit.vue';
  import timingScreen from './timing.vue';
  import previewScreen from './lyric.vue';
  import debugScreen from './debug.vue';
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
    <home-screen v-if="activeScreen == 'home'" />
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
      animation: slide-up 0.3s var(--timing-standard) forwards;
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
