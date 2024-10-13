<script setup lang="ts">
import type MusicService from "@/api/service";

import { onMounted, onUnmounted, ref, shallowReactive } from "vue";
import { Icon } from "@iconify/vue";

import {
	getKeybinds,
	keyHandlers as handlers,
	processKey,
} from "./keybinds/keys";

import {
	Divider,
	IconButton,
	Scroller,
	Floater,
	throttler,
	getUnique,
	CircularProgress,
	useModal,
	MODAL,
	hasFormFocused,
} from "@vue-material/core";
import { useScreen } from "@/hooks/use-screen";
import { useConfig } from "@/hooks/use-config";
import { useSession } from "@/hooks/use-session";
import { useLang } from "@/hooks/use-lang";

import I18nString from "./i18n-string.vue";
import floatingKeybind from "./keybinds/main.vue";
import _presets from "./modals/presets";
import Seeker from "./seeker.vue";

const screen = useScreen();
const config = useConfig();
const session = useSession();
const modal = useModal();
const lang = useLang("en");

const Player = window.app.player;
const Screen = window.app.screen;
const Keybinds = getKeybinds();

const player = shallowReactive({
	loading: Player.ready,
	loop: Player.instance.loop,
	playing: !Player.instance.paused,
	metadata: Player.details,
	picture: Player.picture,
	time: 0,
});

const panelShown = ref(false);

const playPause = (state?: boolean) => {
	player.playing = state ?? !Player.instance.paused;
};

function onMusicUpdate(this: MusicService): void {
	Object.assign(player, {
		loading: false,
		loop: this.instance.loop,
		playing: !this.instance.paused,
		metadata: this.details,
		picture: this.picture,
		time: this.currentTime,
	});
}

function handleTimeUpdate(this: MusicService) {
	throttler(
		() => {
			if (!this.ready) return;
			player.time = this.currentTime;
		},
		{
			key: "app-player",
			wait: 500,
			endCall: true,
		},
	);
}

function formatTime(time: number) {
	if (!Number.isFinite(time)) return "-:--";
	const mins = String(Math.floor(time / 60));
	const secs = String(Math.floor(time % 60)).padStart(2, "0");

	return `${mins}:${secs}`;
}

function handleKeyUp(e: KeyboardEvent) {
	if (hasFormFocused()) return;
	if (["edit", "timing"].includes(screen.value)) return;
	processKey(Keybinds.player.playPause, e, () => Player.playPause());
}

function setLoop(loop?: boolean) {
	loop ??= !Player.instance.loop;
	Player.instance.loop = loop;
	player.loop = loop;
}

function handleKeyDown(e: KeyboardEvent) {
	if (screen.value !== "edit") {
		processKey(Keybinds.uploadLRC, e, handlers.uploadLRC);
		processKey(Keybinds.uploadAudio, e, handlers.uploadAudio);
		processKey(Keybinds.downloadLRC, e, handlers.downloadLRC);
	}

	if (Screen.value !== "timing" && !hasFormFocused()) {
		processKey(Keybinds.player.seekBackward, e, handlers.player.seekBackward);
		processKey(Keybinds.player.seekForward, e, handlers.player.seekForward);
	}

	processKey(Keybinds.tabHome, e, () => Screen.set("home"));
	processKey(Keybinds.tabEdit, e, () => Screen.set("edit"));
	processKey(Keybinds.tabTiming, e, () => Screen.set("timing"));
	processKey(Keybinds.tabLyrics, e, () => Screen.set("lyric"));
	processKey(Keybinds.showKeybinds, e, handlers.showKeybinds);

	processKey(Keybinds.settings, e, () => _presets.openSettings());
}

function playerError() {
	player.loading = false;
	modal.open("not-audio-file", {
		icon: "material-symbols:error-outline",
		title: "Not an audio file",
		content: "Please select an audio file",
		actions: MODAL.PRESET_ACTION_CLOSE("OK"),
		focusLock: true,
	});
}

function playerLoading() {
	player.loading = true;
}

onMounted(() => {
	onMusicUpdate.call(Player);

	Player.addEventListener("playpause", playPause);
	Player.addEventListener("timeupdate", handleTimeUpdate);
	Player.addEventListener("musicupdated", onMusicUpdate);
	Player.addEventListener("error", playerError);
	Player.addEventListener("loading", playerLoading);

	window.addEventListener("keyup", handleKeyUp);
	window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
	Player.removeEventListener("playpause", playPause);
	Player.removeEventListener("timeupdate", handleTimeUpdate);
	Player.removeEventListener("musicupdated", onMusicUpdate);
	Player.removeEventListener("error", playerError);
	Player.removeEventListener("loading", playerLoading);

	window.removeEventListener("keyup", handleKeyUp);
	window.removeEventListener("keydown", handleKeyDown);
});
</script>

<template>
  <div class="app-player">
    <div class="main-panel">
      <Seeker />
      <floating-keybind v-if="config.preferences.showKeyBinds" />

      <div class="controls">
        <IconButton
        @click="Player.currentTime -= 5"
          :disabled="!Player.ready"
          :title="lang.get('PLAYER_BACKWARD')"
          class="seek-backward"
          icon="material-symbols:fast-rewind"
        />
        <CircularProgress
          v-if="player.loading"
          :stroke="4"
          :value="Infinity"
          :diameter="48"
          class="play-button"
        />
        <IconButton
          v-else
          :data-playing="player.playing ? 'true' : 'false'"
          :disabled="!Player.ready"
          :onclick="() => Player.playPause()"
          class="play-button"
          :size="36"
          :icon="`material-symbols:${player.playing ? 'pause' : 'play-arrow'}`"
          :title="lang.get('PLAYER_PLAY') + ' / ' + lang.get('PLAYER_PAUSE')"
        />
        <IconButton
        @click="Player.currentTime += 5"
          :disabled="!Player.ready"
          :title="lang.get('PLAYER_FORWARD')"
          class="seek-forward"
          icon="material-symbols:fast-forward"
        />
      </div>

      <div class="music-info">
        <img
          :src="
            player.loading
              ? '/assets/dummy.svg' 
              : player.picture?.data || '/assets/dummy.svg'
          "
          alt="Album art"
        />

        <div class="details">
          <template v-if="player.loading">
            <Scroller class="title">Processing Audio...</Scroller>
            <Scroller class="artist">Loading audio metadata...</Scroller>
          </template>
          <template v-else>
            <div class="title">
              <I18nString
                :element="Scroller"
                entry="PLAYER_NO_AUDIO"
                v-if="!player.metadata?.title"
              />
              <Scroller v-else>
                {{ player.metadata.title }}
              </Scroller>
            </div>
            <span class="artist">
              <I18nString
                :element="Scroller"
                entry="PLAYER_NO_ARTIST"
                v-if="!player.metadata.artist"
              />
              <Scroller v-else>
                <span>{{ player.metadata.artist }}</span>
                <span class="album">
                  {{ player.metadata.album && ' • ' }}
                  {{ player.metadata.album }}
                </span>
              </Scroller>
            </span>
          </template>
        </div>
      </div>

      <div class="time">
        {{ formatTime(player.time) }} /
        {{ formatTime(player.metadata.duration) }}
      </div>

      <div class="actions">
        <IconButton
          @click="Player.reset()"
          :disabled="!Player.ready"
          id="reset-audio"
          title="Change Audio"
          icon="material-symbols:close"
        />

        <Floater text="AUDIO" pos="bottom">
          <IconButton
            :disabled="player.loading"
            @click="handlers.uploadAudio"
            id="upload-music"
            title="Change Audio"
            icon="material-symbols:upload"
          />
        </Floater>
        <IconButton
          id="repeat"
          title="Repeat / Loop"
          icon="material-symbols:repeat"
          @click="setLoop()"
          :selected="player.loop"
        />
        <IconButton
          id="tag-sync"
          title="Sync Lyric Tags (Not Working ATM)"
          icon="material-symbols:sync"
          disabled
        />
        <IconButton
          id="sub-panel-toggle"
          title="Open Sub-Panel"
          icon="material-symbols:expand-less"
          @click="panelShown = !panelShown"
        />
      </div>
    </div>

    <div class="sub-panel" :shown="panelShown">
      <div class="wrapper">
        <div class="time">
          <span class="current">
            {{ formatTime(player.time) }}
          </span>
          <span class="duration">{{ formatTime(player.metadata.duration) }}</span>
        </div>

        <div class="controls">
          <IconButton
            :onclick="() => Player.reset()"
            :disabled="!Player.ready"
            id="reset-audio-2"
            title="Change Audio"
            icon="material-symbols:close"
          />

          <divider direction="y" :size="24" margin="sm" />

          <IconButton
            :disabled="!Player.ready"
            :onclick="Player.currentTime -= 5"
            class="seek-backward"
            title="Seek Backward"
            icon="material-symbols:fast-rewind"
          />
          <CircularProgress
            v-if="player.loading"
            :stroke="4" 
            :value="Infinity"
            :diameter="48"
            class="play-button"
          />
          <IconButton
            v-else
            :data-playing="player.playing"
            :disabled="!Player.ready"
            class="play-button"
            :size="36"
            :icon="`material-symbols:${player.playing ? 'pause' : 'play-arrow'}`"
            :title="lang.get('PLAYER_PLAY') + ' / ' + lang.get('PLAYER_PAUSE')"
            @click="Player.playPause()"
          />

          <IconButton
            id="seek-forward"
            title="Seek Forward"
            icon="material-symbols:fast-forward"
            :disabled="!Player.ready"
            @click="Player.currentTime += 5"
          />

          <divider direction="y" :size="24" margin="sm" />

          <IconButton
            id="repeat2"
            title="Repeat / Loop"
            icon="material-symbols:repeat"
            @click="setLoop()"
            :selected="player.loop"
          />
        </div>

        <Divider direction="x" size="100%" margin="sm" />
        <div class="sub-button" @click="handlers.uploadAudio">
          <Icon icon="material-symbols:upload-sharp" :width="24" />
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
          transition: rotate 0.3s var(--timing-standard);
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
          background: var(--mono-20);
          border-radius: var(--xxs);
          width: var(--size-md);
        }

        .details {
          .title {
            font-weight: 500;
            font-size: var(--font-md);
            line-height: 1.5;
          }

          .artist {
            font-size: var(--font-md);
            color: var(--mono-50);
          }
        }
      }

      .time {
        grid-area: time;
        margin-left: auto;
        align-self: center;
        white-space: nowrap;
        color: var(--mono-50);
        font-size: var(--font-sm);
      }
    }

    .sub-panel {
      background: var(--app-modal-color);
      display: none;
    }
  }

  @media screen and (max-width: 600px) {
    .app-player {
      --app-player-height: 5rem;
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
        .music-seeker {
          inset: calc(var(--app-player-height) + var(--md)) var(--xl) auto
            var(--xl);
        }
      }

      &:not(:has(.sub-panel[shown='true'])) {
        .music-seeker {
          height: 1px;
          pointer-events: none;
          inset: auto 0 0 0;
          .progress {
            background-color: transparent;
          }
          .progress-bar::after {
            display: none;
          }
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
        max-height: 0;
        position: relative;
        transition: max-height 0.25s var(--timing-standard);
        overflow-y: hidden;

        &[shown='true'] {
          max-height: 150px;
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
            background-color: var(--primary-60-20);
            border-radius: var(--sm);
            display: flex;
          }
        }
      }
    }
  }
</style>
