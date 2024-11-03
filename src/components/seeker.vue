<script setup lang="ts">
import type MusicService from '@/api/service'
import { clamp, throttler, useDrag, useRect } from '@vue-material/core'
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'

const Player = window.app.player
const Lyrics = window.app.lyric

const audio = reactive({
	time: Player.currentTime,
	duration: Player.instance.duration,
})

const root = ref<HTMLElement>()
const rect = useRect(root)

function update() {
	if (!Player.ready || dragging.value) return

	audio.time = Player.currentTime
}

function timeUpdate(this: MusicService) {
	throttler(update, {
		key: 'seeker',
		wait: 500,
		endCall: true,
	})
}

function onMusicUpdate(this: MusicService) {
	audio.duration = this.instance.duration
}

function setter(x: number, set = true) {
	if (!rect.ready || !root.value) return
	const offset = clamp(x - rect.left, 0, rect.width)
	const time = (offset / rect.width) * Player.instance.duration

	audio.time = time

	if (set) {
		Player.currentTime = time
	}
}

const [dragging, dragEvent] = useDrag({
	move: ({ x }) => setter(x, false),
	end: ({ x }) => setter(x, true),
})

const seekerWidth = computed(() => {
	return Player.ready ? (audio.time / (audio.duration ?? 0)) * 100 : 0
})

onMounted(() => {
	Player.addEventListener('musicupdated', onMusicUpdate)
	Player.instance.addEventListener('timeupdate', timeUpdate)
})

onUnmounted(() => {
	Player.removeEventListener('musicupdated', onMusicUpdate)
	Player.instance.removeEventListener('timeupdate', timeUpdate)
})
</script>

<template>
  <div class="music-seeker" @pointerdown="dragEvent">
    <div class="progress" ref="root" :style="{ '--offset': seekerWidth + '%' }">
      <div class="progress-bar" :class="{ dragging }" :data-val="Lyrics.timeToString(audio.time * 1000)" />
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
          background: var(--mono-10);
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
        background: var(--primary-60-30);
        height: 2px !important;

        .progress-bar {
          background-color: var(--primary-90);
        }

        .progress-bar::after {
          opacity: 1;
        }
      }
    }
  }
</style>
