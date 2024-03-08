<script setup lang="ts">
  import type MusicService from '@/api/service';
  import { rateLimiter } from '@/api/util';
  import { onMounted, onUnmounted, ref } from 'vue';

  const music = window.app.player;

  const time = ref(0)
  const duration = ref(NaN);

  function timeUpdate(this: MusicService) {
    rateLimiter(() => {
      time.value = this.currentTime
    }, ["seeker", 500])
  }

  function onMusicUpdate(this: MusicService) {
    duration.value = this.duration
  }

  function seek(event: MouseEvent) {
    const elem = event.currentTarget as HTMLElement
    const x = event.clientX - elem.getBoundingClientRect().left

    const currentTime = x / elem.clientWidth * music.duration
    music.currentTime = currentTime
    time.value = currentTime
  }

  function seeked(this: MusicService) {
    time.value = this.currentTime
  }

  onMounted(() => {
    music.addEventListener("timeupdate", timeUpdate)
    music.addEventListener("musicupdated", onMusicUpdate)
    music.addEventListener("seeked", seeked)
  })

  onUnmounted(() => {
    music.removeEventListener("timeupdate", timeUpdate)
    music.removeEventListener("musicupdated", onMusicUpdate)
    music.removeEventListener("seeked", seeked)
  })
</script>

<template>
  <div @click="seek" class="music-seeker" v-if="isFinite(duration)">
    <div class="progress">
      <div
        :style="`width: ${(time / music.duration) * 100}%`"
        class="progress-bar"
      ></div>
    </div>
  </div>
</template>

<style lang="scss">
  .music-seeker {
    display: flex;
    height: 16px;
    position: fixed;
    inset: auto 0 calc(var(--app-player-height) - 8px) 0;
    z-index: 3;
    cursor: pointer;

    &:hover .progress {
      height: 4px;

      & .progress-bar::after {
        width: 12px;
        height: 12px;
      }
    }

    .progress {
      height: 2px;
      width: 100%;
      align-self: center;
      background: #7777;
      transition: height 0.2s;

      .progress-bar {
        display: flex;
        align-items: center;
        position: relative;
        height: 100%;
        background: red;
      }

      .progress-bar::after {
        content: "";
        right: 0;
        position: absolute;
        display: block;
        width: 2px;
        height: 2px;
        background: inherit;
        transform: translateX(50%);
        border-radius: 99px;
      }
    }
  }
</style>
