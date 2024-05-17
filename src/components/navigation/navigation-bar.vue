<script setup lang="ts">
  import { inject, onMounted, onUnmounted, ref, type Ref, watch } from 'vue';

  import I18nString from '../elements/i18n-string.vue';
  import IconButton from '../elements/button/icon-button.vue';
  import NavigationContent from '../elements/navigation-bar/content.vue';
  import NavigationEntry from '../elements/navigation-bar/entry.vue';
  import NavigationItem from '../elements/navigation-bar/item.vue';
  import NavigationBar from '../elements/navigation-bar/main.vue';
  import _presets from '../modals/_presets';
  import AppLogo from './app-logo.vue';

  const Screen = window.app.screen;
  const screenIndex = ref(0);

  const debug = inject<Ref<boolean>>('app-debug')!;

  const screens = ['edit', 'timing', 'lyric', 'debug'];

  function onScreenUpdate() {
    screenIndex.value = screens.indexOf(Screen.current);
  }

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

<template>
  <NavigationBar v-model:active="screenIndex" labels="active">
    <NavigationContent>
      <AppLogo />
    </NavigationContent>
    <NavigationItem icon="material-symbols:edit-outline">
      <I18nString entry="APP_EDIT" />
    </NavigationItem>
    <NavigationItem icon="material-symbols:hourglass-outline">
      <I18nString entry="APP_TIMING" />
    </NavigationItem>
    <NavigationItem icon="material-symbols:queue-music">
      <I18nString entry="APP_LYRIC" />
    </NavigationItem>
    <NavigationItem icon="material-symbols:bug-report-outline" v-if="debug">
      <I18nString entry="DEBUG" />
    </NavigationItem>
    <NavigationEntry
      id="nav-item-settings"
      icon="material-symbols:settings-outline"
      :onclick="_presets.openSettings"
    >
      <I18nString entry="SETTINGS" />
    </NavigationEntry>

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

<style scoped>
  @media screen and (min-width: 600px) {
    #nav-item-settings {
      display: none;
    }
  }
</style>
