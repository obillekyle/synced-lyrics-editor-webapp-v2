<script setup lang="ts">
  import {
    inject,
    ref,
    watch,
    type Ref,
    watchEffect,
    onMounted,
    onBeforeUnmount,
    computed,
  } from 'vue';
  import type { ScrollToFN } from '../helper';
  import Edit from '@/components/screens/edit.vue';

  const Editor = inject<Ref<HTMLDivElement | null>>('Editor')!;
  const char = inject<Ref<number>>('char')!;
  const line = inject<Ref<number>>('line')!;

  const rootDimensions =
    inject<Ref<{ width: number; height: number }>>('rootDimensions')!;
  const scrollWidth = inject<Ref<number>>('scrollWidth')!;
  const charHeight = inject<Ref<number>>('charHeight')!;
  const scrollTo = inject<ScrollToFN>('scrollTo')!;

  const thumbSize = ref(0);
  const thumbOffset = ref(0);
  const dragging = ref(false);
  const thumb = ref<HTMLElement | null>(null);

  function setThumbVals() {
    const element = Editor.value!;

    if (element) {
      const rect = element.getBoundingClientRect();
      thumbSize.value = rect.width / element.scrollWidth;
      thumbOffset.value = element.scrollLeft / element.scrollWidth;
    }
  }

  function handleMouseMove(event: MouseEvent) {
    const root = Editor.value!;
    if (dragging.value && root) {
      const rRect = root.getBoundingClientRect();
      const thumbWidth = thumb.value!.getBoundingClientRect().width;
      const x = event.clientX - rRect.left - thumbWidth / 2;
      const offset = (x / rRect.width) * root.scrollWidth;
      document.body.style.pointerEvents = 'none';
      scrollTo({ x: offset });
    }
  }

  function handleMouseDown() {
    dragging.value = true;
  }

  function handleMouseUp() {
    dragging.value = false;
    document.body.style.pointerEvents = 'auto';
  }

  watch(rootDimensions, setThumbVals);
  watch(scrollWidth, setThumbVals);
  watch(char, setThumbVals);
  watch(line, setThumbVals);

  onMounted(() => {
    setThumbVals();

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseUp);
  });

  onBeforeUnmount(() => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('mouseleave', handleMouseUp);
  });
</script>

<template>
  <div
    class="scrollbar-horizontal"
    v-if="thumbSize < 0.99"
    @mousedown="handleMouseDown"
    :style="{
      '--thumb-size': thumbSize,
      '--thumb-offset': thumbOffset,
    }"
  >
    <div class="thumb" :class="{ dragging }" ref="thumb" />
  </div>
</template>

<style lang="scss">
  .scrollbar-horizontal {
    position: absolute;
    height: var(--scrollbar-size);
    right: var(--scrollbar-size);
    left: var(--number-width);
    bottom: 0;
    overflow: hidden;
    user-select: none;

    .thumb {
      background: #9999;
      height: 100%;
      position: absolute;
      left: calc(var(--thumb-offset) * 100%);
      width: calc(var(--thumb-size) * 100%);
      opacity: 0;
      transition: opacity 0.3s ease;
      &.dragging {
        opacity: 1;
        background: #ccc;
      }
    }
  }
</style>
