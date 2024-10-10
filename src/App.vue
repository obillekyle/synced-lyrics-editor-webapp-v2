<script setup lang="ts">
  import { onMounted, onUnmounted, provide, ref, watch } from 'vue';

  import type MusicService from './api/service';
  import AppTag from './components/elements/Text/app-tag.vue';
  import I18nString from './components/elements/Text/i18n-string.vue';
  import Progress from './components/elements/Progress/linear-progress.vue';
  import AppHeader from './components/header.vue';
  import Modals from './components/modals/main.vue';
  import NavigationBar from './components/navigation/navigation-bar.vue';
  import AppPlayer from './components/player.vue';
  import LrcScreen from './components/screens/main.vue';
  import Styles from './components/styles.vue';
  import { interval, removeInterval } from './api/util';
  import { defaultColor } from '@/app/main';
  import LyricCard from './components/screens/lyric-card.vue';
  import _presets from './components/modals/_presets';
  import Test from './components/test.vue';
import { Layout, Navigation } from '@vue-material/core';

  const Player = window.app.player;
  const Colors = window.app.colors;
  const Screen = window.app.screen;
  const Option = window.app.options;
  const Lang = window.app.i18n;
  const Files = window.app.files;
  const Lyrics = window.app.lyric;

  const lang = ref('en');
  const screen = ref('timing');
  const theme = ref('dark');
  const debug = ref(false);
  const devTag = ref(false);
  const ready = ref(false);
  const showHome = ref(false);
  const showTranslate = ref(false);
  const timingSort = ref(false);
  const intervalKey = ref<number>();
  const loaderRef = ref<HTMLElement | null>(null);
  const centerNav = ref(false);
  const appPath = ref('/');

  async function onPlayerUpdate(this: MusicService) {
    Colors.set(Player.picture?.color || defaultColor);

    if (!isFinite(Player.duration)) return;

    const fileUrl = await fetch(Player.src);
    const file = await fileUrl.blob();

    !(await Files.exists('/editor', 'audio.bin'))
      ? await Files.createFile('/editor', 'audio.bin', file)
      : await Files.modifyFile('/editor/audio.bin', file);
  }

  async function onPlayerReset(this: MusicService) {
    Colors.set(Player.picture?.color || defaultColor);
    await Files.delete('/editor/audio.bin');
  }

  function langUpdate() {
    Option.set('lang', Lang.lang);
    lang.value = Lang.lang;
    setTimeout(() => {
      ready.value = Lang.ready;
    }, 200);
  }

  function onPathChange() {
    if (appPath.value !== window.location.pathname) {
      appPath.value = window.location.pathname;
    }
  }

  function setScreen() {
    screen.value = Screen.current;
  }

  function optionsUpdate() {
    theme.value = Option.get('theme', 'dark');
    debug.value = Option.get('debug', false);
    showHome.value = Option.get('showHome', true);
    devTag.value = Option.get('dev-tag', false);
    centerNav.value = Option.get('centered-nav-buttons', true);
  }

  async function loadSession() {
    if (await Files.exists('/editor', 'audio.bin')) {
      const fileMeta = await Files.getFile('/editor/audio.bin');
      if (fileMeta) {
        const fileData = await Files.getFileData(fileMeta.store);
        Player.updateFile(fileData);
      }
    }

    if (await Files.exists('/editor', 'lyrics.json')) {
      const fileMeta = await Files.getFile('/editor/lyrics.json');
      if (fileMeta) {
        const fileData = await Files.getFileData(fileMeta.store);
        const rawText = fileData ? await fileData.text() : '{}';
        const json = JSON.parse(JSON.parse(rawText));

        Lyrics.import({
          lines: json.lines || [],
          tags: json.tags || {},
        });
      }
    }
  }

  async function saveLyrics(e?: Event) {
    const lrcJSON = Lyrics.getJSON();
    const lrcBlob = new Blob([JSON.stringify(lrcJSON)]);

    e?.preventDefault();

    if (lrcJSON) {
      (await Files.exists('/editor', 'lyrics.json'))
        ? await Files.modifyFile('/editor/lyrics.json', lrcBlob)
        : await Files.createFile('/editor', 'lyrics.json', lrcBlob);
    }
  }

  provide('app-lang', lang);
  provide('app-screen', screen);
  provide('app-theme', theme);
  provide('app-debug', debug);
  provide('showTranslate', showTranslate);
  provide('app-timing-sort', timingSort);
  provide('app-show-home', showHome);
  provide('app-dev-tag', devTag);
  provide('app-center-nav', centerNav);

  function hideLoader() {
    if (loaderRef.value) {
      loaderRef.value.style.display = 'none';
    }
  }

  watch(appPath, (path) => {
    const metaDesc = document.querySelector('meta[name="description"]');
    if (path.startsWith('/lyric-card')) {
      document.title = 'Lyrics Card Maker | Synced Lyrics Editor and Maker v2 ';
      if (metaDesc) {
        metaDesc.setAttribute(
          'content',
          'Create your own lyrics card in seconds with our new lyrics card maker.'
        );
      }
    } else {
      document.title = 'Synced Lyrics Editor and Maker v2';
      if (metaDesc) {
        metaDesc.setAttribute(
          'content',
          'Create your own synced lyrics for the music you love – right from your browser. A sound file is required.'
        );
      }
    }
  });

  onMounted(() => {
    langUpdate();
    setScreen();
    optionsUpdate();
    loadSession();
    onPathChange();

    intervalKey.value = interval(() => saveLyrics(), 1000);

    Player.addEventListener('musicupdated', onPlayerUpdate);
    Player.addEventListener('reset', onPlayerReset);
    Screen.addEventListener('update', setScreen);
    Option.addEventListener('event', optionsUpdate);
    Lang.addEventListener('update', langUpdate);
    window.addEventListener('beforeunload', saveLyrics);
    loaderRef.value?.addEventListener('animationend', hideLoader);

    const observer = new MutationObserver(onPathChange);
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('popstate', onPathChange);
  });

  onUnmounted(() => {
    if (intervalKey.value) {
      removeInterval(intervalKey.value);
    }
    Player.removeEventListener('musicupdated', onPlayerUpdate);
    Player.removeEventListener('reset', onPlayerReset);
    Screen.removeEventListener('update', setScreen);
    Option.removeEventListener('event', optionsUpdate);
    Lang.removeEventListener('ready', langUpdate);
    loaderRef.value?.removeEventListener('animationend', hideLoader);

    window.removeEventListener('beforeunload', saveLyrics);
  });
</script>

<template>
  <div class="loader" :class="{ ready }" ref="loaderRef">
    <img alt="App Logo" src="/logo.svg" width="96" height="96" />
    <Progress :value="Infinity" />
  </div>

  <Layout>
    <template #navbar>
      <Navigation>
        <AppLogo />

        <Navigation.Item>
      </Navigation>
    </template>

  </Layout>
  <template v-if="ready">
    <Test v-if="appPath === '/test'" />
    <LyricCard v-else-if="appPath === '/lyric-card'" />
    <template v-else>
      <I18nString entry="ALPHA" :element="AppTag" v-if="!devTag" />
      <div class="content-wrapper">
        <AppHeader />
        <main tabindex="0">
          <LrcScreen />
        </main>
        <AppPlayer />
      </div>
      <NavigationBar />
    </template>
    {{ appPath }}

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
    transition: opacity 0.4s;
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

  main {
    position: relative;
    display: block;
    height: calc(100dvh - var(--app-header-height) - var(--app-player-height));
    width: calc(100dvw - var(--app-navbar-size));
    transform: translate(0, 0);
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

<style lang="scss">
  #app:has([data-screen='lyric']) {
    background: linear-gradient(
        to bottom,
        var(--primary-10-40) -20%,
        var(--primary-10-70) 20%,
        var(--primary-10-90) 60%,
        var(--primary-10) 100%
      ),
      var(--album-blur, var(--primary-10));
    background-size: cover;
    height: 100dvh;
    background-position: center, center;
  }
</style>
