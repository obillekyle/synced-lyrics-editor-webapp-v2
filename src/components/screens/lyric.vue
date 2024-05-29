<script setup lang="ts">
  import type MusicService from '@/api/service';
  import { $, rippleEffect, throttler } from '@/api/util';
  import {
    type Ref,
    inject,
    onMounted,
    onUnmounted,
    ref,
    shallowRef,
  } from 'vue';
  import animatedScroll from 'animated-scroll-to';
  import playingIndicator from '../playing-indicator.vue';
  import { getTranslatedText } from '@/api/util/main';
  import AwaitedText from '../elements/Text/awaited-text.vue';

  const Player = window.app.player;
  const Lyrics = window.app.lyric;
  const Lang = window.app.i18n;

  const lyrics = shallowRef(Lyrics.getRaw());
  const bypass = ref(false);

  const previewPane = ref<HTMLElement | null>(null);
  const currentIndex = ref(-1);
  const showTranslate = inject<Ref<boolean>>('showTranslate')!;
  const lang = Lang.lang;

  const lrcChange = () => {
    lyrics.value = Lyrics.getRaw();
  };

  function handleCurrentIndex(this: MusicService) {
    throttler(
      async () => {
        const index = Lyrics.findIndex(this.currentTime * 1000 + 400);
        if (index == -1 || currentIndex.value == index) return;

        bypass.value = false;
        const element = previewPane.value?.children[index];

        if (element) {
          currentIndex.value = index;
          const main = $('main')!;

          const previous = previewPane.value?.querySelector('.active');
          previous?.classList.remove('active');
          element?.classList.add('active');

          const rect = main.getBoundingClientRect();
          const halfElement = element.clientHeight / 2;
          const offset = rect.height / 2 - halfElement;

          await animatedScroll(element, {
            speed: 400,
            elementToScroll: main,
            verticalOffset: offset * -1,
          });
        }
      },
      {
        key: 'getLRCIndex',
        blockTime: 100,
        bypass: bypass.value,
        endCall: true,
      }
    );
  }

  const resetIndex = () => {
    bypass.value = true;
    currentIndex.value;
    handleCurrentIndex.call(Player);
  };

  function isError(index: number) {
    return (
      index > 0 &&
      lyrics.value.lines[index - 1].time > lyrics.value.lines[index].time
    );
  }

  function setTime(time: number) {
    if (isFinite(Player.duration)) {
      bypass.value = true;
      Player.currentTime = time / 1000;
    }
  }

  onMounted(() => {
    lrcChange();
    Lyrics.addEventListener('parsed', lrcChange);
    Player.addEventListener('timeupdate', handleCurrentIndex);
    Player.addEventListener('musicupdated', resetIndex);
  });

  onUnmounted(() => {
    Lyrics.removeEventListener('parsed', lrcChange);
    Player.removeEventListener('timeupdate', handleCurrentIndex);
    Player.removeEventListener('musicupdated', resetIndex);
  });
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
          v-if="showTranslate && data"
          :text="getTranslatedText(data, lang)"
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
    color: var(--color-900-20);

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
        transition: all 0.25s var(--timing-standard);
        &:has(.playing-indicator) {
          scale: 1;
        }

        &:has(.translated) span {
          font-size: 24px;
          color: var(--mono-500);
        }
      }

      &.active .data {
        color: var(--color-900);
        scale: 1;
      }

      &:not(.active) .playing-indicator div {
        transform: scaleY(0.05);
        animation: none !important;
      }
    }
  }
</style>
