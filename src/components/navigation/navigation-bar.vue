<script setup lang="ts">
  import type { Screens } from '@/app/main'

  import { computed } from 'vue';

  import { Navigation, Floater, IconButton } from '@vue-material/core'
  import { AppScreens } from '@/app/main';
  import { useScreen } from '@/hooks/use-screen';
  import { useConfig } from '@/hooks/use-config';
  
  import _presets from '../modals/_presets';
  import AppLogo from './app-logo.vue';
  import I18nString from '../elements/Text/i18n-string.vue';

  type NavigationItem = {
    icon: string;
    value: number;
    tKey: string;
    label: string;
    visible?: boolean;
  }

  const screen = useScreen();
  const config = useConfig();
  const screens = computed<Record<Screens, NavigationItem>>(() => ({
    home: {
      icon: 'material-symbols:home-outline',
      value: 0,
      tKey: 'APP_HOME',
      label: 'Home',
      visible: config.navigation.showHome,
    },
    edit: {
      icon: 'material-symbols:edit-outline',
      value: 1,
      tKey: 'APP_EDIT',
      label: 'Edit',
    },
    timing: {
      icon: 'material-symbols:hourglass-outline',
      value: 2,
      tKey: 'APP_TIMING',
      label: 'Timing',
    },
    lyric: {
      icon: 'material-symbols:queue-music',
      value: 3,
      tKey: 'APP_LYRIC',
      label: 'Lyric',
    },
    debug: {
      icon: 'material-symbols:bug-report-outline',
      value: 4,
      tKey: 'DEBUG',
      label: 'Debug',
      visible: config.debug,
    }
  }))

  const screenIndex = computed({
    get: () => AppScreens.indexOf(screen.value),
    set: (value) => {
      screen.value = AppScreens[value] ?? 'home'
    },
  });
</script>

<template>
  <Navigation v-model="screenIndex">
    <Navigation.Content>
      <AppLogo />
    </Navigation.Content>

    <Navigation.Container :center="config.navigation.centered" v-model="screenIndex">
      <template v-for="(item, key) in screens">
        <Navigation.Item
          v-if="item.visible ?? true"
          :value="AppScreens.indexOf(key)"
          :icon="item.icon"
        >
          <I18nString :entry="item.tKey" :fallback="item.label"/>
        </Navigation.Item>
      </template>

      <Navigation.Entry
        id="nav-item-settings"
        icon="material-symbols:settings-outline"
        :onclick="_presets.openSettings"
      >
        <I18nString entry="SETTINGS" />
      </Navigation.Entry>
    </Navigation.Container>

    <Navigation.Content :style="{ paddingBottom: 'var(--md)' }">
      <Floater :text="config.preferences.lang.toUpperCase()" offset="4">
        <IconButton
          icon="material-symbols:settings-outline"
          class="settings"
          title="Settings"
          :onclick="_presets.openSettings"
        />
      </Floater>
    </Navigation.Content>
  </Navigation>
</template>

<style scoped>
  @media screen and (min-width: 600px) {
    #nav-item-settings {
      display: none;
    }
  }
</style>
