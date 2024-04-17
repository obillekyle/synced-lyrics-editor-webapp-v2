<script setup lang="ts">
  import AppPlayer from './components/player.vue';
  import AppHeader from './components/header.vue';
  import { onMounted, onUnmounted, provide, ref, watch } from 'vue';
  import type MusicService from './api/service';
  import Styles from './components/styles.vue';
  import Modals from './components/modals/main.vue';
  import LrcScreen from './components/screens/main.vue';
  import NavigationBar from './components/navigation/navigation-bar.vue';
  const Player = window.app.player;
  const Colors = window.app.colors;

  function onPlayerUpdate(this: MusicService) {
    Colors.set(Player.picture?.color || '#ccc');
  }

  onMounted(() => {
    Player.addEventListener('musicupdated', onPlayerUpdate);
  });
  onUnmounted(() => {
    Player.removeEventListener('musicupdated', onPlayerUpdate);
  });
</script>

<template>
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

<style>
  #app:has([data-screen='lyric']) {
    background: linear-gradient(
        to bottom,
        #00000080 -20%,
        #000000d1 20%,
        #000000f4 60%,
        #000000 100%
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
        100dvh - var(--app-header-height) - var(--app-player-height) -
          var(--app-navbar-size)
      );
    }
    .content-wrapper {
      inset: 0 0 var(--app-navbar-size) 0;
    }
  }
</style>
