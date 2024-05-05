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
  <div v-if="activeScreen == 'edit'" class="app-main-content">
    <edit-screen />
  </div>

  <div v-if="activeScreen == 'timing'" class="app-main-content">
    <timing-screen />
  </div>

  <div v-if="activeScreen == 'lyric'" class="app-main-content">
    <preview-screen />
  </div>

  <div v-if="activeScreen == 'debug'" class="app-main-content">
    <debug-screen />
  </div>
</template>

<style lang="scss">
  .app-main-content {
    padding-block: 40dvh;

    &:has(.edit-screen, .debug-screen) {
      padding-block: 0;
      padding: var(--md);
    }
  }
</style>
