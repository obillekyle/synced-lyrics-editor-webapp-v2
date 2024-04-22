<script setup lang="ts">
  import {
    computed,
    inject,
    ref,
    watch,
    type Ref,
    watchEffect,
    onMounted,
    onBeforeUnmount,
  } from 'vue';
  import type { ScrollToFN } from '../helper';

  const Editor = inject<Ref<HTMLDivElement | null>>('Editor')!;
  const char = inject<Ref<number>>('char')!;
  const line = inject<Ref<number>>('line')!;

  const root =
    inject<Ref<{ width: number; height: number }>>('rootDimensions')!;
  const scrollHeight = inject<Ref<number>>('scrollHeight')!;
  const charHeight = inject<Ref<number>>('charHeight')!;
  const scrollTo = inject<ScrollToFN>('scrollTo')!;

  const thumbSize = ref(0);
  const thumbOffset = ref(0);
  const dragging = ref(false);
  const lineIndicatorPos = ref(0);
  const thumb = ref<HTMLElement | null>(null);

  function setThumbVals() {
    const element = Editor.value!;

    if (element) {
      const rect = element.getBoundingClientRect();
      const lineOffset = charHeight.value * line.value;

      thumbSize.value = rect.height / element.scrollHeight;
      thumbOffset.value = element.scrollTop / element.scrollHeight;
      lineIndicatorPos.value = lineOffset / element.scrollHeight;
    }
  }

  function handleMouseMove(event: MouseEvent) {
    const root = Editor.value!;
    if (dragging.value && root) {
      const rRect = root.getBoundingClientRect();
      const thumbHeight = thumb.value!.getBoundingClientRect().height;
      const y = event.clientY - rRect.top - thumbHeight / 2;
      const offset = (y / rRect.height) * root.scrollHeight;
      document.body.style.pointerEvents = 'none';
      scrollTo({ y: offset });
    }
  }

  function handleMouseDown() {
    dragging.value = true;
  }

  function handleMouseUp() {
    dragging.value = false;
    document.body.style.pointerEvents = 'auto';
  }

  watch(root, setThumbVals);
  watch(scrollHeight, setThumbVals);
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
    class="scrollbar-vertical"
    v-if="thumbSize < 0.99"
    @mousedown="handleMouseDown"
    :style="{
      '--thumb-size': thumbSize,
      '--thumb-offset': thumbOffset,
      '--line-indicator-pos': lineIndicatorPos,
    }"
  >
    <div class="thumb" :class="{ dragging }" ref="thumb" />
    <div class="indicator" />
  </div>
</template>

<style lang="scss">
  .scrollbar-vertical {
    position: absolute;
    width: var(--scrollbar-size);
    right: 0;
    bottom: 0;
    top: 0;
    overflow: hidden;
    user-select: none;
    border-left: 1px solid #3337;
    border-top: 1px solid #3337;
    .thumb {
      width: 100%;
      position: absolute;
      background: #9999;
      top: calc(var(--thumb-offset) * 100%);
      height: calc(var(--thumb-size) * 100%);
      opacity: 0;
      transition: opacity 0.3s ease;
      &.dragging {
        opacity: 1;
        background: #ccc;
      }
    }

    .indicator {
      height: 2px;
      width: 100%;
      position: absolute;
      background: #aaa;
      top: calc(var(--line-indicator-pos) * 100%);
    }
  }
</style>
