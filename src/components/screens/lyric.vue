<script setup lang="ts">
  import type MusicService from '@/api/service';
  import { $, throttler } from '@/api/util';
  import { onMounted, onUnmounted, reactive, ref, shallowRef } from 'vue';
  import animatedScroll from 'animated-scroll-to';
  import playingIndicator from '../playing-indicator.vue';

  const Player = window.app.player;
  const Lyrics = window.app.lyric;

  const lyrics = shallowRef(Lyrics.getJSON());
  const bypass = ref(false);

  const previewPane = ref<HTMLElement | null>(null);
  const currentIndex = ref(-1);

  const lrcChange = () => {
    lyrics.value = Lyrics.getJSON();
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
        blockTime: 200,
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

  onMounted(() => {
    lrcChange();
    Lyrics.addEventListener('lrc-updated', lrcChange);
    Player.addEventListener('timeupdate', handleCurrentIndex);
    Player.addEventListener('musicupdated', resetIndex);
  });

  onUnmounted(() => {
    Lyrics.removeEventListener('lrc-updated', lrcChange);
    Player.removeEventListener('timeupdate', handleCurrentIndex);
    Player.removeEventListener('musicupdated', resetIndex);
  });
</script>

<template>
  <div class="preview-screen" ref="previewPane">
    <div
      :key="index"
      class="lrc-line"
      :onclick="
        () => {
          if (isFinite(Player.duration)) {
            bypass = true;
            Player.currentTime = time / 1000;
          }
        }
      "
      v-for="({ data, time }, index) in lyrics.lines"
    >
      <div class="data multi" v-if="typeof data == 'object'">
        {{ data.map(({ line }) => line).join('') }}
      </div>
      <div class="data" v-else-if="data == '♪'">
        <playing-indicator />
      </div>
      <div class="data" v-else>
        {{ data }}
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  .preview-screen {
    color: var(--color-600-20);

    &:empty::after {
      content: 'No lyric available';
      display: block;
      text-align: center;
      font-size: var(--font-xl);
    }

    .lrc-line {
      padding-block: var(--xl);
      user-select: none;
      cursor: pointer;

      .data {
        scale: 0.8;
        text-wrap: balance;
        letter-spacing: 1px;
        text-align: center;
        font-weight: 500;
        font-size: 36px;
        transition: all 0.3s;
        &:has(.playing-indicator) {
          scale: 1;
        }
      }

      &.active .data {
        color: var(--color-900);
        scale: 1;
      }
      &:hover {
        background-color: #7772;
      }
      &:not(.active) .playing-indicator div {
        transform: scaleY(0.05);
        animation: none !important;
      }
    }
  }
</style>
