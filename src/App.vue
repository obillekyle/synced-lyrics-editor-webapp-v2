<script setup lang="ts">
  import appPlayer from './components/player.vue';
  import lrcScreen from './components/screens.vue';
  import seeker from './components/seeker.vue';
  import appHeader from './components/header.vue';
  import { onMounted, onUnmounted, ref } from 'vue';
  import type MusicService from './api/service';
  import modals from './components/modals.vue';
  import styles from './components/styles.vue';

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
  <app-header />
  <main tabindex="0">
    <lrc-screen />
  </main>
  <seeker />
  <app-player />
  <modals />
  <styles />
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
    overflow: overlay;
  }
</style>
