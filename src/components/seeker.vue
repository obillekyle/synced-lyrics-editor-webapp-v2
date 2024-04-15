<script setup lang="ts">
  import type MusicService from '@/api/service';
  import { throttler } from '@/api/util';
  import { onMounted, onUnmounted, ref } from 'vue';

  const Player = window.app.player;

  const time = ref(0);
  const duration = ref(NaN);

  function timeUpdate(this: MusicService) {
    throttler(
      () => {
        time.value = this.currentTime;
      },
      {
        key: 'seeker',
        blockTime: 500,
        endCall: true,
      }
    );
  }

  function onMusicUpdate(this: MusicService) {
    duration.value = this.duration;
  }

  function seek(event: MouseEvent) {
    if (!isFinite(Player.duration)) return;
    const elem = event.currentTarget as HTMLElement;
    const x = event.clientX - elem.getBoundingClientRect().left;

    const currentTime = (x / elem.clientWidth) * Player.duration;
    Player.currentTime = currentTime;
    time.value = currentTime;
  }

  function seeked(this: MusicService) {
    time.value = this.currentTime;
  }

  onMounted(() => {
    Player.addEventListener('timeupdate', timeUpdate);
    Player.addEventListener('musicupdated', onMusicUpdate);
    Player.addEventListener('seeked', seeked);
  });

  onUnmounted(() => {
    Player.removeEventListener('timeupdate', timeUpdate);
    Player.removeEventListener('musicupdated', onMusicUpdate);
    Player.removeEventListener('seeked', seeked);
  });
</script>

<template>
  <div @click="seek" class="music-seeker">
    <div class="progress">
      <div
        v-if="isFinite(duration)"
        :style="`width: ${(time / Player.duration) * 100}%`"
        class="progress-bar"
      ></div>
    </div>
  </div>
</template>

<style lang="scss">
  .music-seeker {
    display: flex;
    height: 16px;
    position: absolute;
    inset: -8px 0 auto 0;
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
        content: '';
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

  @media screen and (max-width: 600px) {
    .music-seeker {
      .progress {
        background: var(--color-600-30);
        height: 2px !important;

        .progress-bar {
          background-color: var(--color-900);
        }

        .progress-bar::after {
          height: 12px;
          width: 12px;
        }
      }
    }
  }
</style>
