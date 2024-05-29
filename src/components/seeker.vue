<script setup lang="ts">
  import type MusicService from '@/api/service';
  import { throttler, getClientPos, getUnique, clamp } from '@/api/util';
  import { computed, onMounted, onUnmounted, ref } from 'vue';

  const Player = window.app.player;
  const Lyrics = window.app.lyric;

  const time = ref(0);
  const duration = ref(NaN);
  const bypass = ref<number>();
  const wrapper = ref<HTMLElement | null>(null);
  const id = getUnique('seeker');

  function timeUpdate(this: MusicService) {
    throttler(
      () => {
        if (!isFinite(Player.duration)) return;
        time.value = this.currentTime;
      },
      {
        key: id,
        blockTime: 500,
        endCall: true,
      }
    );
  }

  function onMusicUpdate(this: MusicService) {
    duration.value = this.duration;
  }

  function seekStart(event: MouseEvent | TouchEvent) {
    if (!isFinite(Player.duration)) return;
    bypass.value = Player.currentTime;
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
    seeking(event);
  }

  function seeking(event: MouseEvent | TouchEvent) {
    if (bypass.value === undefined) return;
    if (!isFinite(Player.duration)) return;
    const pos = getClientPos(event);
    const rect = wrapper.value!.getBoundingClientRect();
    const offset = clamp(pos.x - rect.left, 0, rect.width);

    const currentTime = (offset / rect.width) * Player.duration;
    bypass.value = currentTime;
  }

  function seeked(this: MusicService) {
    if (bypass.value === undefined) return;

    document.body.style.cursor = 'auto';
    document.body.style.userSelect = 'auto';

    Player.currentTime = bypass.value;
    time.value = bypass.value;
    bypass.value = undefined;
  }

  const seekerWidth = computed(() => {
    const newTime = bypass.value ?? time.value;

    return (newTime / Player.duration || 0) * 100;
  });

  onMounted(() => {
    Player.addEventListener('timeupdate', timeUpdate);
    Player.addEventListener('musicupdated', onMusicUpdate);
    Player.addEventListener('seeked', seeked);

    document.addEventListener('mousemove', seeking);
    document.addEventListener('touchmove', seeking);

    document.addEventListener('mouseup', seeked);
    document.addEventListener('touchend', seeked);
    document.addEventListener('touchcancel', seeked);
  });

  onUnmounted(() => {
    Player.removeEventListener('timeupdate', timeUpdate);
    Player.removeEventListener('musicupdated', onMusicUpdate);
    Player.removeEventListener('seeked', seeked);

    document.removeEventListener('mousemove', seeking);
    document.removeEventListener('touchmove', seeking);

    document.removeEventListener('mouseup', seeked);
    document.removeEventListener('touchend', seeked);
    document.removeEventListener('touchcancel', seeked);
  });
</script>

<template>
  <div class="music-seeker" @mousedown="seekStart" @touchstart="seekStart">
    <div class="progress" ref="wrapper">
      <div
        class="progress-bar"
        :class="{ dragging: bypass !== undefined }"
        :style="`--offset: ${seekerWidth}%`"
        :data-val="Lyrics.timeToString((bypass ?? time) * 1000)"
      />
    </div>
  </div>
</template>

<style lang="scss">
  .music-seeker {
    display: flex;
    height: 16px;
    user-select: none;
    position: absolute;
    inset: -8px 0 auto 0;
    z-index: 3;
    cursor: grab;

    &:hover,
    &:has(.dragging) {
      .progress {
        height: 4px;

        & .progress-bar::after {
          opacity: 1;
        }
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
        width: var(--offset);

        &.dragging {
          cursor: grabbing;

          &::before {
            transform: translate(50%, -100%);
            opacity: 1;
          }

          &::after {
            width: 16px;
            height: 16px;
          }
        }

        &::before {
          right: 0;
          content: attr(data-val);
          position: absolute;
          transform: translate(50%, -50%);
          background: var(--mono-100);
          padding: var(--xs);
          font-size: var(--font-sm);
          border-radius: var(--xs);
          transition: all 0.2s;
          box-shadow: 0 2px 5px #0005;
          opacity: 0;
        }
      }

      .progress-bar::after {
        content: '';
        right: 0;
        position: absolute;
        display: block;
        width: 12px;
        height: 12px;
        background: inherit;
        transform: translateX(50%);
        opacity: 0;
        transition:
          opacity 0.2s,
          width 0.2s,
          height 0.2s;
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
          opacity: 1;
        }
      }
    }
  }
</style>
