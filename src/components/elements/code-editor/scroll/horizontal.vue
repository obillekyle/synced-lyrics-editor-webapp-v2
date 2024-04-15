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

  const Editor = inject<Ref<HTMLDivElement | null>>('Editor')!;
  const char = inject<Ref<number>>('char')!;
  const line = inject<Ref<number>>('line')!;

  const rootDimensions =
    inject<Ref<{ width: number; height: number }>>('rootDimensions')!;
  const scrollWidth = inject<Ref<number>>('scrollWidth')!;
  const scrollTo =
    inject<(pos: { x?: number; y?: number }) => void>('scrollTo')!;

  const thumbSize = ref(0);
  const thumbOffset = ref(0);
  const dragging = ref(false);

  function setThumbVals() {
    const element = Editor.value!;

    if (element) {
      const rect = element.getBoundingClientRect();
      thumbSize.value = rect.width / element.scrollWidth;
      thumbOffset.value = element.scrollLeft / element.scrollWidth;
      console.log(thumbSize.value, thumbOffset.value);
    }
  }

  function handleMouseMove(event: MouseEvent) {
    const root = Editor.value!;
    if (dragging.value && root) {
      const rRect = root.getBoundingClientRect();
      const thumbSizePX = thumbSize.value * rRect.width;

      const x = event.clientX - rRect.left;
      const offset = (x / rRect.width) * root.scrollWidth - thumbSizePX / 1.5;
      scrollTo({ x: offset });

      console.log(x, event.clientX, offset);
    }
  }

  function handleMouseDown() {
    dragging.value = true;
  }

  function handleMouseUp() {
    dragging.value = false;
  }

  watchEffect(setThumbVals);

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
  });
</script>

<template>
  <div
    class="scrollbar-horizontal"
    v-if="thumbSize < 0.99"
    @mousedown="handleMouseDown"
  >
    <div
      class="thumb"
      :style="{ '--thumb-size': thumbSize, '--thumb-offset': thumbOffset }"
    />
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
    }
  }
</style>
