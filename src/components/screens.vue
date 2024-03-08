<script setup lang="ts">
  import { onMounted, onUnmounted, ref } from 'vue';
  import editScreen from './screens/edit.vue';
  import timingScreen from './screens/timing.vue';
  import previewScreen from './screens/lyric.vue';

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
  <div
    v-if="activeScreen == 'edit'"
    class="app-main-content"
  >
    <edit-screen />
  </div>

  <div
    v-if="activeScreen == 'timing'"
    class="app-main-content"
  >
    <timing-screen />
  </div>

  <div
    v-if="activeScreen == 'lyric'"
    class="app-main-content"
  >
    <preview-screen />
  </div>
</template>

<style lang="scss">
  .app-main-content {
    padding-block: 40dvh;

    &:has(.edit-screen) {
      padding-block: 0;
      padding: var(--md);
    }
  }
</style>
