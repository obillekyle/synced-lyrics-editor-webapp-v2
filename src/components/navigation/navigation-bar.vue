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
  import { AppScreens, type Screens } from '@/app/main';

  const Screen = window.app.screen;
  const screenIndex = ref(0);

  const debug = inject<Ref<boolean>>('app-debug')!;

  function onScreenUpdate() {
    const index = AppScreens.indexOf(Screen.current);
    if (screenIndex.value !== index) {
      screenIndex.value = index;
    }
  }

  function setScreen(index: number) {
    screenIndex.value = index;
    Screen.set(AppScreens[index]);
  }

  onMounted(() => {
    onScreenUpdate();
    Screen.addEventListener('update', onScreenUpdate);
  });

  onUnmounted(() => {
    Screen.removeEventListener('update', onScreenUpdate);
  });
</script>

<template>
  <NavigationBar :active="screenIndex" labels="active" :change="setScreen">
    <NavigationContent>
      <AppLogo />
    </NavigationContent>
    <NavigationItem
      icon="material-symbols:edit-outline"
      :value="AppScreens.indexOf('edit')"
    >
      <I18nString entry="APP_EDIT" />
    </NavigationItem>
    <NavigationItem
      icon="material-symbols:hourglass-outline"
      :value="AppScreens.indexOf('timing')"
    >
      <I18nString entry="APP_TIMING" />
    </NavigationItem>
    <NavigationItem
      icon="material-symbols:queue-music"
      :value="AppScreens.indexOf('lyric')"
    >
      <I18nString entry="APP_LYRIC" />
    </NavigationItem>
    <NavigationItem
      icon="material-symbols:bug-report-outline"
      v-if="debug"
      :value="AppScreens.indexOf('debug')"
    >
      <I18nString entry="DEBUG" />
    </NavigationItem>
    <NavigationItem
      icon="material-symbols:folder-outline"
      v-if="debug"
      :value="AppScreens.indexOf('files')"
    >
      <I18nString entry="FILES" fallback="Files" />
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
