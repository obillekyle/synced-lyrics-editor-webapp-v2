<script setup lang="ts">
  import { onMounted, onUnmounted, ref } from 'vue';

  import type MusicService from '@/api/service';
  import { throttler } from '@/api/util';
  import { i18n } from '@/app/i18n';
  import { Icon } from '@iconify/vue';

  import Divider from './elements/divider.vue';
  import I18nString from './elements/i18n-string.vue';
  import iconButton from './elements/button/icon-button.vue';
  import {
    getKeybinds,
    keyHandlers as handlers,
    processKey,
  } from './keybinds/keys';
  import floatingKeybind from './keybinds/main.vue';
  import _presets from './modals/_presets';
  import Seeker from './seeker.vue';
  import MdProgress from './elements/progress/circular-progress.vue';
  import IconButton from './elements/button/icon-button.vue';
  import Scroller from './elements/scroller.vue';

  const Player = window.app.player;
  const Screen = window.app.screen;
  const Keybinds = getKeybinds();
  const Option = window.app.options;

  const time = ref(0);
  const shown = ref(false);
  const loading = ref(true);
  const audioLoop = ref(false);
  const playing = ref(!Player.paused);
  const picture = ref(Player.picture);
  const metadata = ref(Player.getDetails());
  const showKeyBinds = ref(Option.get('showKeyBinds', false));

  const playPause = () => (playing.value = !Player.paused);
  function onMusicUpdate(this: MusicService): void {
    playing.value = false;
    metadata.value = Player.getDetails();
    picture.value = Player.picture;
    loading.value = false;
  }

  function handleTimeUpdate(this: MusicService) {
    throttler(
      () => {
        time.value = this.currentTime;
      },
      {
        key: 'player',
        blockTime: 500,
        endCall: true,
      }
    );
  }

  function formatTime(time: number) {
    if (!isFinite(time)) return '-:--';
    const mins = Math.floor(time / 60).toString();
    const secs = Math.floor(time % 60).toString();

    const minutes = mins.padStart(2, '0');
    const seconds = secs.padStart(2, '0');

    return `${minutes}:${seconds}`;
  }

  function handleKeyUp(e: KeyboardEvent) {
    if (Screen.current == 'edit' || Screen.current == 'timing') return;

    processKey(Keybinds.player.playPause, e, () => Player.playPause());
  }

  function setLoop(loop?: boolean) {
    if (typeof loop != 'boolean') loop = undefined;
    Player.loop = loop ?? !Player.loop;
    audioLoop.value = Player.loop;
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (Screen.current != 'edit') {
      processKey(Keybinds.uploadLRC, e, handlers.uploadLRC);
      processKey(Keybinds.uploadAudio, e, handlers.uploadAudio);
      processKey(Keybinds.downloadLRC, e, handlers.downloadLRC);
    }

    if (Screen.current != 'edit' && Screen.current != 'timing') {
      processKey(Keybinds.player.seekBackward, e, handlers.player.seekBackward);
      processKey(Keybinds.player.seekForward, e, handlers.player.seekForward);
    }

    processKey(Keybinds.tabHome, e, () => Screen.set('home'));
    processKey(Keybinds.tabEdit, e, () => Screen.set('edit'));
    processKey(Keybinds.tabTiming, e, () => Screen.set('timing'));
    processKey(Keybinds.tabLyrics, e, () => Screen.set('lyric'));
    processKey(Keybinds.showKeybinds, e, handlers.showKeybinds);

    processKey(Keybinds.settings, e, () => _presets.openSettings());
  }

  function updateShown() {
    showKeyBinds.value = Option.get('showKeyBinds', false);
  }

  function playerError() {
    loading.value = false;
  }

  function playerLoading() {
    loading.value = true;
  }

  onMounted(() => {
    onMusicUpdate.call(Player);
    updateShown();

    Player.addEventListener('play', playPause);
    Player.addEventListener('pause', playPause);
    Player.addEventListener('timeupdate', handleTimeUpdate);
    Player.addEventListener('musicupdated', onMusicUpdate);
    Player.addEventListener('error', playerError);
    Player.addEventListener('loading', playerLoading);

    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('keydown', handleKeyDown);
    Option.addEventListener('event', updateShown);
  });

  onUnmounted(() => {
    Player.removeEventListener('play', playPause);
    Player.removeEventListener('pause', playPause);
    Player.removeEventListener('timeupdate', handleTimeUpdate);
    Player.removeEventListener('musicupdated', onMusicUpdate);
    Player.removeEventListener('error', playerError);
    Player.removeEventListener('loading', playerLoading);

    window.removeEventListener('keyup', handleKeyUp);
    window.removeEventListener('keydown', handleKeyDown);
    Option.removeEventListener('event', updateShown);
  });
</script>

<template>
  <div class="app-player">
    <div class="main-panel">
      <Seeker />
      <floating-keybind v-if="showKeyBinds" />

      <div class="controls">
        <IconButton
          :disabled="!isFinite(Player.duration)"
          :onclick="() => Player.fastSeek(-5)"
          :title="i18n('PLAYER_BACKWARD')"
          class="seek-backward"
          icon="material-symbols:fast-rewind"
        />
        <MdProgress
          v-if="loading"
          :stroke="4"
          :value="Infinity"
          :diameter="48"
          class="play-button"
        />
        <button
          v-else
          :data-playing="playing ? 'true' : 'false'"
          :disabled="!isFinite(Player.duration)"
          :onclick="() => Player.playPause()"
          class="icon-button play-button"
          :title="i18n('PLAYER_PLAY') + ' / ' + i18n('PLAYER_PAUSE')"
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
        <IconButton
          :disabled="!isFinite(Player.duration)"
          :onclick="() => Player.fastSeek(5)"
          :title="i18n('PLAYER_FORWARD')"
          class="seek-forward"
          icon="material-symbols:fast-forward"
        />
      </div>

      <div class="music-info">
        <img :src="picture?.data || '/assets/dummy.svg'" alt="Album art" />

        <div class="details">
          <div class="title">
            <I18nString
              :element="Scroller"
              entry="PLAYER_NO_AUDIO"
              v-if="!metadata?.title"
            />
            <Scroller v-else>
              {{ metadata.title }}
            </Scroller>
          </div>
          <span class="artist">
            <I18nString
              :element="Scroller"
              entry="PLAYER_NO_ARTIST"
              v-if="!metadata?.artist"
            />
            <Scroller v-else>
              <span>{{ metadata.artist }}</span>
              <span class="album">
                {{ metadata?.album && ' • ' }}
                {{ metadata?.album }}
              </span>
            </Scroller>
          </span>
        </div>
      </div>

      <div class="time">
        {{ formatTime(time) }} /
        {{ formatTime(Player.duration) }}
      </div>

      <div class="actions">
        <icon-button
          @click="() => Player.reset()"
          :disabled="!isFinite(Player.duration)"
          id="reset-audio"
          title="Change Audio"
          icon="material-symbols:close"
        />
        <icon-button
          @click="handlers.uploadAudio"
          id="upload-music"
          title="Change Audio"
          icon="material-symbols:upload"
        />
        <icon-button
          id="repeat"
          title="Repeat / Loop"
          icon="material-symbols:repeat"
          @click="() => setLoop()"
          :active="audioLoop"
        />
        <icon-button
          id="tag-sync"
          title="Sync Lyric Tags (Not Working ATM)"
          icon="material-symbols:sync"
          disabled
        />
        <icon-button
          id="sub-panel-toggle"
          title="Open Sub-Panel"
          icon="material-symbols:expand-less"
          :onclick="() => (shown = !shown)"
        />
      </div>
    </div>

    <div class="sub-panel" :shown="shown">
      <div class="wrapper">
        <div class="time">
          <span class="current">
            {{ isFinite(Player.duration) ? formatTime(time) : '-:--' }}
          </span>
          <span class="duration">{{ formatTime(Player.duration) }}</span>
        </div>

        <div class="controls">
          <icon-button
            :onclick="() => Player.reset()"
            :disabled="!isFinite(Player.duration)"
            id="reset-audio-2"
            title="Change Audio"
            icon="material-symbols:close"
          />

          <divider direction="y" :size="24" margin="sm" />

          <icon-button
            :disabled="!isFinite(Player.duration)"
            :onclick="() => Player.fastSeek(-5)"
            class="seek-backward"
            title="Seek Backward"
            icon="material-symbols:fast-rewind"
          />
          <button
            :data-playing="playing ? 'true' : 'false'"
            :disabled="!isFinite(Player.duration)"
            :onclick="() => Player.playPause()"
            class="icon-button play-button"
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
          <icon-button
            :disabled="!isFinite(Player.duration)"
            :onclick="() => Player.fastSeek(5)"
            id="seek-forward"
            title="Seek Forward"
            icon="material-symbols:fast-forward"
          />

          <divider direction="y" :size="24" margin="sm" />

          <icon-button
            id="repeat2"
            title="Repeat / Loop"
            icon="material-symbols:repeat"
            :onclick="() => setLoop()"
            :active="audioLoop"
          />
        </div>

        <Divider direction="x" size="100%" margin="sm" />
        <div class="sub-button" @click="handlers.uploadAudio">
          <icon icon="material-symbols:upload-sharp" :width="24" />
          <span>Upload Audio</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  .app-player {
    position: absolute;
    inset: auto 0 0 0;
    z-index: 10;

    border-top: 1px solid #7777;
    background-color: var(--app-player-color);

    .main-panel {
      display: grid;
      gap: var(--sm);
      align-content: center;
      padding-left: var(--sm);

      height: var(--app-player-height);

      grid-template-columns: auto auto minmax(0px, 1fr) auto;
      grid-template-areas: 'controls time music-info actions';
      overflow: hidden;
      .controls {
        grid-area: controls;
        display: flex;
      }

      #repeat:not([active='true']),
      #repeat2:not([active='true']) {
        opacity: 0.5;
      }

      .actions {
        display: flex;
        flex-wrap: nowrap;
        grid-area: actions;
        background-color: var(--app-player-color);

        #sub-panel-toggle {
          display: none;
          transition: rotate 0.3s;
        }
      }

      .music-info {
        height: 100%;
        grid-area: music-info;
        display: flex;
        align-items: center;
        margin-inline: auto;

        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;

        img {
          aspect-ratio: 1 / 1;
          object-fit: contain;
          background: #333;
          border-radius: 2px;
          width: 40px;
        }

        .details {
          .title {
            font-weight: 500;
            font-size: var(--font-md);
            line-height: 1.5;
          }

          .artist {
            font-size: var(--font-md);

            color: darkgray;
          }
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
    }

    .play-button {
      &[data-playing='true'] .playing,
      &[data-playing='false'] .paused {
        display: block;
      }
      > div > * {
        display: none;
      }
    }

    .sub-panel {
      background: var(--app-modal-color);
      display: none;
    }
  }

  @media screen and (max-width: 600px) {
    .app-player {
      border-top-left-radius: var(--md);
      border-top-right-radius: var(--md);

      #repeat:not([active='true']),
      #repeat2:not([active='true']) {
        opacity: 0.5;
      }

      .main-panel {
        grid-template-columns: 1fr auto auto auto;
        grid-template-areas: 'music-info time controls  actions';
        padding-left: var(--md);
        overflow: hidden;

        .actions {
          #sub-panel-toggle {
            display: block;
          }

          > *:not(#sub-panel-toggle) {
            display: none;
          }
        }

        .music-seeker {
          inset: calc(var(--app-player-height) + var(--md)) var(--xl) auto
            var(--xl);
        }

        .music-info {
          margin: 0;

          .album {
            display: none;
          }

          img {
            width: 48px;
          }
        }

        .time {
          display: none;
        }

        .controls {
          > :not(.play-button) {
            display: none;
          }
          margin-left: auto;
        }
      }

      &:has(.sub-panel[shown='true']) {
        #sub-panel-toggle {
          rotate: 180deg;
        }

        .main-panel .play-button {
          display: none;
        }
      }

      .sub-panel {
        display: block;
        max-height: 0px;
        transition: max-height 0.2s;
        overflow-y: hidden;

        &[shown='true'] {
          max-height: 200px;
        }

        .time {
          padding-inline: var(--sm);
          font-size: var(--font-sm);
          color: darkgray;
          display: flex;
          .current {
            margin-right: auto;
          }
        }

        > .wrapper {
          padding: var(--sm) var(--md);
          padding-top: calc(var(--xl) * 1.5);

          .controls {
            display: flex;
            flex-wrap: nowrap;
            justify-content: center;

            #repeat:not([active='true']),
            #repeat2:not([active='true']) {
              opacity: 0.5;
            }
          }

          .sub-button {
            padding: var(--sm);
            align-items: center;
            gap: var(--sm);
            background-color: var(--color-600-20);
            border-radius: var(--sm);
            display: flex;
          }
        }
      }
    }
  }
</style>
