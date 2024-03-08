<script setup lang="ts">
  import type MusicService from '@/api/service';
  import { $, rateLimiter } from '@/api/util';
  import { onMounted, onUnmounted, reactive, ref } from 'vue';
  import animatedScroll from 'animated-scroll-to';

  const Player = window.app.player;
  const Lyrics = window.app.lyric;

  const lyrics = reactive(Lyrics.getJSON());

  const previewPane = ref<HTMLElement | null>(null);
  const currentIndex = ref(-1);

  const lrcChange = () => {
    const newObj = Lyrics.getJSON();
    lyrics.lines = newObj.lines;
    lyrics.tags = newObj.tags;
  };

  function handleCurrentIndex(this: MusicService) {
    rateLimiter(async () => {
      const index = Lyrics.findIndex(this.currentTime * 1000 + 400);
      if (index == -1 || currentIndex.value == index) return;

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
    }, ['getLRCIndex', 200]);
  }

  const resetIndex = () => (currentIndex.value = -1);

  onMounted(() => {
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
  <div
    class="preview-screen"
    ref="previewPane"
  >
    <div
      :key="index"
      class="lrc-line"
      :onclick="() => (Player.currentTime = time / 1000)"
      v-for="({ data, time }, index) in lyrics.lines"
    >
      <div
        class="data multi"
        v-if="typeof data == 'object'"
      >
        {{ data.map(({ line }) => line).join('') }}
      </div>
      <div
        class="data"
        v-else
      >
        {{ data }}
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  .preview-screen {
    color: var(--overlay-20);

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
      }

      &.active .data {
        color: var(--color-900);
        scale: 1;
      }
      &:hover {
        background-color: #7772;
      }
    }
  }
</style>
