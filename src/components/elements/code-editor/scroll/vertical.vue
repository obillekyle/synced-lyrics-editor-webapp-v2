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
  const scrollHeight = inject<Ref<number>>('scrollHeight')!;
  const scrollTo =
    inject<(pos: { x?: number; y?: number }) => void>('scrollTo')!;

  const thumbSize = ref(0);
  const thumbOffset = ref(0);
  const dragging = ref(false);

  function setThumbVals() {
    const element = Editor.value!;

    if (element) {
      const rect = element.getBoundingClientRect();
      thumbSize.value = rect.height / element.scrollHeight;
      thumbOffset.value = element.scrollTop / element.scrollHeight;
    }
  }

  function handleMouseMove(event: MouseEvent) {
    const root = Editor.value!;
    if (dragging.value && root) {
      const rRect = root.getBoundingClientRect();
      const thumbSizePX = thumbSize.value * rRect.height;

      const y = event.clientY - rRect.top;
      const offset = (y / rRect.height) * root.scrollHeight - thumbSizePX / 1.5;
      scrollTo({ y: offset });
    }
  }

  function handleMouseDown() {
    dragging.value = true;
  }

  function handleMouseUp() {
    dragging.value = false;
  }

  watch(rootDimensions, setThumbVals);
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
  });
</script>

<template>
  <div
    class="scrollbar-vertical"
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
    }
  }
</style>
