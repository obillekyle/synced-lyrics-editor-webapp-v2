<template>
  <NavigationBar v-model:active="screenIndex">
    <NavigationContent>
      <AppLogo />
    </NavigationContent>
    <NavigationItem name="Edit" icon="material-symbols:edit-outline" />
    <NavigationItem name="Timing" icon="material-symbols:hourglass-outline" />
    <NavigationItem name="Lyric" icon="material-symbols:queue-music" />

    <NavigationContent>
      <IconButton
        icon="material-symbols:settings-outline"
        class="settings"
        title="Settings"
        :onclick="_presets.openSettings"
      />
    </NavigationContent>
  </NavigationBar>
</template>

<script setup lang="ts">
  import { onMounted, onUnmounted, ref, watch } from 'vue';
  import _presets from '../modals/_presets';

  import NavigationBar from '../elements/navigation-bar/main.vue';
  import NavigationItem from '../elements/navigation-bar/item.vue';
  import NavigationContent from '../elements/navigation-bar/content.vue';
  import IconButton from '../elements/icon-button.vue';
  import AppLogo from './app-logo.vue';

  const Screen = window.app.screen;
  const screenIndex = ref(0);
  function onScreenUpdate() {
    screenIndex.value = screens.indexOf(Screen.current);
  }

  const screens = ['edit', 'timing', 'lyric'];
  watch(screenIndex, (value) => {
    if (screens[value] != Screen.current) {
      Screen.set(screens[value] as any);
    }
  });

  onMounted(() => {
    onScreenUpdate();
    Screen.addEventListener('screenchange', onScreenUpdate);
  });

  onUnmounted(() => {
    Screen.removeEventListener('screenchange', onScreenUpdate);
  });
</script>

<style scoped></style>
