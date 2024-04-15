<script setup lang="ts">
  import { computed, inject, onMounted, onUnmounted, ref, type Ref } from 'vue';
  import {
    type LineItem,
    type EditorSelection,
    type HistoryItem,
    defaultFormatter,
    type TextDimensionsFn,
    isKeyboardKey,
  } from '../helper';
  import lineEntry from './line-entry.vue';
  import { addPX, getParent } from '@/api/util';

  const lines = inject<Ref<LineItem[]>>('lines')!;
  const selection = inject<EditorSelection>('selection')!;

  const scrollHeight = inject<Ref<number>>('scrollHeight')!;
  const line = inject<Ref<number>>('line')!;
  const char = inject<Ref<number>>('char')!;

  const contentRef = ref<HTMLDivElement | null>(null);
  const Content = inject<Ref<HTMLDivElement | null>>('Content')!;
  const isVisible = inject<(index: number) => boolean>('isLineVisible')!;
  const blurAndFocus = inject<(ignore?: boolean) => void>('blurAndFocus')!;
  const Editor = inject<Ref<HTMLDivElement | null>>('Editor')!;
  const textDimensions = inject<TextDimensionsFn>('textDimensions')!;
  const selectRanges = inject<Ref<EditorSelection | null>>('selection')!;

  const charWidth = inject<Ref<number>>('charWidth')!;

  function handleContentClick(event: MouseEvent) {
    const element = event.currentTarget as HTMLDivElement;
    const target = event.target as HTMLDivElement;

    if (target == element) {
      const numLines = lines.value.length;
      const index = (numLines || 1) - 1;
      const item = lines.value[index];
      if (item) {
        char.value = item.text.length;
        line.value = index;
      }
    }

    blurAndFocus();
  }

  const width = computed(() => {
    const width = Editor.value?.scrollWidth || 0;
    const longestText = lines.value.reduce((a, b) => {
      return a.text.length > b.text.length ? a : b;
    });
    const length = textDimensions(longestText.text).width;

    return length > width ? length : width;
  });

  function handleClick(event: MouseEvent) {
    const parent = event.currentTarget as HTMLDivElement;
    const clicked = event.target as HTMLElement;
    const curr = getParent(event.target as HTMLElement, '.line', true);

    if (parent.contains(curr) && curr) {
      const index = Number(curr.dataset.index!);
      const item = lines.value[index];

      const x = event.clientX - curr.getBoundingClientRect().left;
      const arr = item.text.split('');

      let pos = 0;
      let offset = -(charWidth.value / 2);

      for (let i = 0; i < arr.length; i++) {
        if (isKeyboardKey(arr[i])) offset += charWidth.value;
        else offset += textDimensions(arr[i]).width;

        if (offset > x) {
          console.log(offset, x, event.clientX);
          pos = i;
          break;
        }

        if (i == arr.length - 1) {
          pos = i + 1;
        }
      }

      if (item) {
        selectRanges.value = null;
        char.value = pos;
        line.value = index;
      }
    }
  }
</script>

<template>
  <div>
    <div
      ref="contentRef"
      class="content highlight"
      @click="
        (e) => {
          handleContentClick(e);
          handleClick(e);
        }
      "
      :style="{
        '--width': addPX(width),
      }"
    >
      <line-entry
        v-for="({ text, id }, index) in lines"
        :key="id"
        :index="index"
        :text="text"
        :visible="isVisible(index)"
      />
      <div class="line-special" />
    </div>
  </div>
</template>

<style></style>
