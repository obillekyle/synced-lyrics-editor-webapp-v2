<script setup lang="ts">
  import type { AudioImage, AudioDetails } from '@/api/service';
  import { onMounted, onUnmounted, readonly, ref } from 'vue';
  import { Icon } from '@iconify/vue';
  import { $, openFilePicker, rateLimiter } from '@/api/util';
  import type MusicService from '@/api/service';
  import { useAudioLRC } from './_modals';

  const Player = window.app.player;
  const Screen = window.app.screen;

  const time = ref(0);
  const loading = ref(true);
  const playing = ref(!Player.paused);
  const picture = ref(Player.picture);
  const metadata = ref(Player.getDetails());
  const fileInput = ref<HTMLInputElement | null>(null);

  const playPause = () => (playing.value = !Player.paused);
  function onMusicUpdate(this: MusicService): void {
    playing.value = false;
    metadata.value = Player.getDetails();
    picture.value = Player.picture;
    loading.value = false;
  }

  function handleChange(file: File | null) {
    if (!file) return;

    loading.value = true;
    Player.updateFile(file).then((success) => {
      if (!success) {
        loading.value = false;
        return;
      }

      const lrc = Player.metadata?.common.lyrics;
      if (lrc?.length) useAudioLRC();
    });
  }

  function handleTimeUpdate(this: MusicService) {
    time.value = this.currentTime;

    rateLimiter(() => {
      time.value = this.currentTime;
    }, ['player', 750]);
  }

  function handleKeyPress(e: KeyboardEvent) {
    e.key == 'Space' && Player.playPause();
  }

  function handleKeyDown(e: KeyboardEvent) {
    const screen = Screen.current;
    if (screen == 'timing') return;
    if (e.key == 'ArrowLeft') {
      Player.fastSeek(-5);
    }

    if (e.key == 'ArrowRight') {
      Player.fastSeek(5);
    }
  }

  onMounted(() => {
    onMusicUpdate.call(Player);
    Player.addEventListener('play', playPause);
    Player.addEventListener('pause', playPause);
    Player.addEventListener('timeupdate', handleTimeUpdate);
    Player.addEventListener('musicupdated', onMusicUpdate);
    window.addEventListener('keypress', handleKeyPress);
    window.addEventListener('keydown', handleKeyDown);
  });

  onUnmounted(() => {
    Player.removeEventListener('play', playPause);
    Player.removeEventListener('pause', playPause);
    Player.removeEventListener('timeupdate', handleTimeUpdate);
    Player.removeEventListener('musicupdated', onMusicUpdate);
    window.removeEventListener('keypress', handleKeyPress);
    window.removeEventListener('keydown', handleKeyDown);

    Player.reset();
  });

  const uploadFn = () => openFilePicker(handleChange, { accept: 'audio/*' });

  function formatTime(time: number) {
    if (!isFinite(time)) return '00:00';

    const minutes = Math.floor(time / 60)
      .toString()
      .padStart(2, '0');
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, '0');

    return `${minutes}:${seconds}`;
  }
</script>

<template>
  <div class="app-player">
    <input
      :disabled="loading"
      accept="audio/*"
      id="upload"
      ref="fileInput"
      type="file"
    />

    <div class="controls">
      <button
        :disabled="!isFinite(Player.duration)"
        :onclick="() => Player.fastSeek(-5)"
        class="icon-button"
        id="seek-backward"
        title="Seek Backward"
        type="button"
      >
        <div class="wrapper">
          <icon
            :width="24"
            icon="material-symbols:fast-rewind"
          />
        </div>
      </button>
      <button
        :data-playing="playing ? 'true' : 'false'"
        :disabled="!isFinite(Player.duration)"
        :onclick="() => Player.playPause()"
        class="icon-button"
        id="play-button"
        title="Play/Pause"
        type="button"
      >
        <div class="wrapper">
          <icon
            :width="36"
            class="paused"
            icon="material-symbols:play-arrow"
          />
          <icon
            :width="36"
            class="playing"
            icon="material-symbols-light:pause"
          />
        </div>
      </button>
      <button
        :disabled="!isFinite(Player.duration)"
        :onclick="() => Player.fastSeek(5)"
        class="icon-button"
        id="seek-forward"
        title="Seek Forward"
        type="button"
      >
        <div class="wrapper">
          <icon
            :width="24"
            icon="material-symbols:fast-forward"
          />
        </div>
      </button>
    </div>

    <div class="music-info">
      <img
        :src="picture?.data || '/dummy.svg'"
        alt="Album art"
      />

      <div class="details">
        <div class="title">{{ metadata?.title || 'No Audio' }}</div>
        <span>
          {{ metadata?.artist || 'No Artist' }}
          {{ metadata?.album && ' • ' }}
          {{ metadata?.album }}
        </span>
      </div>
    </div>

    <div class="time">
      {{ formatTime(time) }} /
      {{ formatTime(Player.duration) }}
    </div>

    <div class="actions">
      <button
        :onclick="uploadFn"
        class="icon-button"
        id="upload-music"
        title="Change Audio"
        type="button"
      >
        <div class="wrapper">
          <icon
            :width="24"
            icon="material-symbols:upload"
          />
        </div>
      </button>
      <button
        class="icon-button"
        id="tag-sync"
        title="Sync Lyric Tags"
        type="button"
      >
        <div class="wrapper">
          <icon
            :width="24"
            icon="material-symbols:sync"
          />
        </div>
      </button>
    </div>
  </div>
</template>

<style lang="scss">
  .app-player {
    position: fixed;
    inset: auto 0 0 0;

    display: grid;
    gap: var(--sm);
    overflow-x: auto;
    align-content: center;
    height: var(--app-player-height);
    padding-inline: var(--sm);

    border-top: 1px solid #7777;
    background-color: var(--app-player-color);

    grid-template-columns: auto auto 1fr auto;
    grid-template-areas: 'controls time music-info actions';

    .controls {
      grid-area: controls;
      display: flex;
    }

    .actions {
      display: flex;
      flex-wrap: nowrap;
      grid-area: actions;
    }

    .music-info {
      height: 100%;
      grid-area: music-info;
      display: flex;
      align-items: center;
      gap: var(--lg);
      margin-inline: auto;

      img {
        aspect-ratio: 1 / 1;
        object-fit: contain;
        background: #333;
        border-radius: 2px;
        width: 40px;
      }

      .details {
        white-space: nowrap;
        line-height: 1.5;

        .title {
          font-weight: 600;
          font-size: 16px;
        }

        span {
          color: gray;
        }
      }
    }

    #play-button {
      &[data-playing='true'] .playing,
      &[data-playing='false'] .paused {
        display: block;
      }
    }

    .time {
      grid-area: time;
      margin-left: auto;
      align-self: center;
      white-space: nowrap;
      color: darkgray;
      font-size: var(--font-sm);
    }

    input,
    #play-button > div > * {
      display: none;
    }
  }

  @media screen and (max-width: 768px) {
    .app-player {
      grid-template-columns: 1fr auto auto auto;
      grid-template-areas: 'music-info time controls  actions';

      .music-info {
        margin: 0;
        img {
          display: none;
        }
      }

      .time {
        display: none;
      }

      .controls {
        margin-left: auto;
      }
    }
  }
</style>
