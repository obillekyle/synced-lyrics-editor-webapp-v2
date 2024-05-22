<script setup lang="ts">
  import { onMounted, onUnmounted, provide, ref, watch } from 'vue';

  import type MusicService from './api/service';
  import AppTag from './components/elements/app-tag.vue';
  import I18nString from './components/elements/i18n-string.vue';
  import Progress from './components/elements/progress.vue';
  import AppHeader from './components/header.vue';
  import Modals from './components/modals/main.vue';
  import NavigationBar from './components/navigation/navigation-bar.vue';
  import AppPlayer from './components/player.vue';
  import LrcScreen from './components/screens/main.vue';
  import Styles from './components/styles.vue';

  const Player = window.app.player;
  const Colors = window.app.colors;
  const Screen = window.app.screen;
  const Option = window.app.options;
  const Lang = window.app.i18n;

  const screen = ref('timing');
  const theme = ref('dark');
  const debug = ref(false);
  const ready = ref(false);
  const showTranslate = ref(false);
  const timingSort = ref(false);

  function onPlayerUpdate(this: MusicService) {
    Colors.set(Player.picture?.color || '#ccc');
  }

  function langUpdate() {
    setTimeout(() => {
      ready.value = Lang.ready;
    }, 200);
    Option.set('lang', Lang.lang);
  }

  function setScreen() {
    screen.value = Screen.current;
  }

  function optionsUpdate() {
    theme.value = Option.get('theme', 'dark');
    debug.value = Option.get('debug', false);
  }

  provide('app-screen', screen);
  provide('app-theme', theme);
  provide('app-debug', debug);
  provide('showTranslate', showTranslate);
  provide('app-timing-sort', timingSort);


  onMounted(() => {
    langUpdate();
    setScreen();
    optionsUpdate();

    Player.addEventListener('musicupdated', onPlayerUpdate);
    Screen.addEventListener('update', setScreen);
    Option.addEventListener('event', optionsUpdate);
    Lang.addEventListener('update', langUpdate);
  });

  onUnmounted(() => {
    Player.removeEventListener('musicupdated', onPlayerUpdate);
    Screen.removeEventListener('update', setScreen);
    Option.removeEventListener('event', optionsUpdate);
    Lang.removeEventListener('ready', langUpdate);
  });
</script>

<template>
  <div class="loader" :class="{ ready }">
    <img alt="App Logo" src="/logo.svg" width="96" height="96" />
    <Progress :value="Infinity" />
  </div>

  <template v-if="ready">
    <I18nString entry="ALPHA" :element="AppTag" />
    <Styles />
    <div class="content-wrapper">
      <AppHeader />
      <main tabindex="0">
        <LrcScreen />
      </main>
      <AppPlayer />
    </div>

    <NavigationBar />
    <Modals />
  </template>
</template>

<style lang="scss" scoped>
  .loader {
    color: white;
    background: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100dvh;
    width: 100dvw;
    gap: var(--xl);
    position: fixed;
    inset: 0;
    z-index: 1000;
    transition: opacity 0.3s;
    .progress {
      width: clamp(0px, 96px, 500px);
    }
    &.ready {
      opacity: 0;
      pointer-events: none;
    }
  }

  @media (prefers-color-scheme: dark) {
    .loader {
      background: #222;
    }
  }

  #app:has([data-screen='lyric']) {
    background: linear-gradient(
        to bottom,
        var(--mono-100-40) -20%,
        var(--mono-100-70) 20%,
        var(--mono-100-90) 60%,
        var(--mono-100) 100%
      ),
      var(--album-blur);
    background-size: cover;
    height: 100dvh;
    background-position: center, center;
  }

  main {
    position: relative;
    display: block;
    height: calc(100dvh - var(--app-header-height) - var(--app-player-height));
    width: calc(100dvw - var(--app-navbar-size));
    overflow: overlay;

    &:has(.preview-screen) {
      mask-image: linear-gradient(
        to bottom,
        transparent 0%,
        black 56px,
        black calc(100% - 56px),
        transparent 100%
      );
    }
  }

  .content-wrapper {
    position: fixed;
    contain: content;
    inset: 0 0 0 var(--app-navbar-size);
    overflow: hidden;
  }

  @media screen and (max-width: 600px) {
    main {
      width: 100vw;
      height: calc(
        100dvh - var(--app-header-height) - var(--app-player-height) - var(
            --app-navbar-size
          )
      );

      &::-webkit-scrollbar {
        width: 0px;
        height: 0px;
      }
    }
    .content-wrapper {
      inset: 0 0 var(--app-navbar-size) 0;
    }
  }
</style>
