<script setup lang="ts">
import type MusicService from '@/api/service'
import animatedScroll from 'animated-scroll-to'
import { type Ref, inject, onMounted, onUnmounted, ref, shallowRef } from 'vue'
import playingIndicator from '../playing-indicator.vue'

import { useLang } from '@/hooks/use-lang'
import { useSession } from '@/hooks/use-session'
import {
	$,
	AwaitedText,
	getTranslatedText,
	rippleEffect,
	throttler,
} from '@vue-material/core'

const Player = window.app.player
const Lyrics = window.app.lyric

const lyrics = shallowRef(Lyrics.getRaw())
const bypass = ref(false)

const previewPane = ref<HTMLElement | null>(null)
const currentIndex = ref(-1)
const session = useSession()
const lang = useLang('en')

const lrcChange = () => {
	bypass.value = true
	lyrics.value = Lyrics.getRaw()
	handleCurrentIndex.call(Player)
}

function handleCurrentIndex(this: MusicService) {
	throttler(
		async () => {
			const index = Lyrics.findIndex(this.currentTime * 1000 + 300)
			if (index === -1 || currentIndex.value === index) return

			bypass.value = false
			const element = previewPane.value?.children[index]

			if (element) {
				currentIndex.value = index
				// biome-ignore lint/style/noNonNullAssertion: <explanation>
				const main = $('main')!

				const previous = previewPane.value?.querySelector('.active')
				previous?.classList.remove('active')
				element?.classList.add('active')

				const rect = main.getBoundingClientRect()
				const halfElement = element.clientHeight / 1.75
				const offset = rect.height / 2 - halfElement

				await animatedScroll(element, {
					speed: 400,
					elementToScroll: main,
					verticalOffset: offset * -1,
				})
			}
		},
		{
			key: 'getLRCIndex',
			wait: 100,
			ignore: bypass.value,
			endCall: true,
		},
	)
}

const resetIndex = () => {
	bypass.value = true
	currentIndex.value
	handleCurrentIndex.call(Player)
}

function isError(index: number) {
	return (
		index > 0 &&
		lyrics.value.lines[index - 1].time > lyrics.value.lines[index].time
	)
}

function setTime(time: number) {
	if (Player.ready) {
		bypass.value = true
		Player.currentTime = time / 1000
	}
}

onMounted(() => {
	lrcChange()
	Lyrics.addEventListener('parsed', lrcChange)
	Player.addEventListener('timeupdate', handleCurrentIndex)
	Player.addEventListener('musicupdated', resetIndex)
})

onUnmounted(() => {
	Lyrics.removeEventListener('parsed', lrcChange)
	Player.removeEventListener('timeupdate', handleCurrentIndex)
	Player.removeEventListener('musicupdated', resetIndex)
})
</script>

<template>
  <div class="preview-screen" ref="previewPane">
    <div
      :key="index"
      class="lrc-line"
      @click="setTime(time)"
      @pointerdown="rippleEffect"
      :class="{ error: isError(index) }"
      v-for="({ data, time }, index) in lyrics.lines"
    >
      <div class="data multi" v-if="typeof data == 'object'">
        {{ data.map(({ line }) => line).join('') }}
      </div>
      <div class="data" v-else-if="data == '♪'">
        <playing-indicator />
      </div>
      <div class="data" v-else>
        <AwaitedText
          v-if="session.preview.translate && data"
          :text="getTranslatedText(data, lang.lang)"
          element="div"
          class="translated"
        />
        <span>{{ data }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  .preview-screen {
    padding-block: calc((85dvh - 112px) / 2);
    color: var(--primary-90-20);

    &:empty::after {
      content: 'No lyric available';
      display: block;
      text-align: center;
      font-size: var(--font-xl);
    }

    .lrc-line {
      position: relative;
      overflow: hidden;
      padding-block: var(--xl);
      padding-inline: var(--md);
      user-select: none;
      cursor: pointer;

      &.error {
        background-color: #f001;
      }

      .data {
        scale: 0.8;
        text-wrap: balance;
        letter-spacing: 1px;
        text-align: center;
        font-weight: 500;
        font-size: 36px;
        width: clamp(0px, 100%, 768px);
        margin-inline: auto;
        transition: all 0.25s var(--timing-standard);
        &:has(.playing-indicator) {
          scale: 1;
        }

        &:has(.translated) span {
          font-size: 24px;
          color: var(--mono-50);
        }
      }

      &.active .data {
        color: var(--primary-90);
        scale: 1;
      }

      &:not(.active) .playing-indicator div {
        transform: scaleY(0.05);
        animation: none !important;
      }
    }
  }
</style>
