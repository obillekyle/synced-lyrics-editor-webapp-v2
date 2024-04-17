<script setup lang="ts">
  import { computed, inject, onMounted, onUnmounted, ref, type Ref } from 'vue';
  import {
    type LineItem,
    type EditorSelection,
    type TextDimensionsFn,
    isKeyboardKey,
    type ScrollToFN,
  } from '../helper';
  import lineEntry from './line-entry.vue';
  import {
    addPX,
    clamp,
    getParent,
    interval,
    removeInterval,
  } from '@/api/util';

  const lines = inject<Ref<LineItem[]>>('lines')!;
  const line = inject<Ref<number>>('line')!;
  const char = inject<Ref<number>>('char')!;

  const contentRef = ref<HTMLDivElement | null>(null);
  const Editor = inject<Ref<HTMLDivElement | null>>('Editor')!;
  const selectRanges = inject<Ref<EditorSelection | null>>('selection')!;
  const ignoreScroll = inject<Ref<boolean>>('ignoreScroll')!;

  const isVisible = inject<(index: number) => boolean>('isLineVisible')!;
  const TextArea = inject<Ref<HTMLTextAreaElement | null>>('TextArea')!;
  const textDimensions = inject<TextDimensionsFn>('textDimensions')!;
  const scrollTo = inject<ScrollToFN>('scrollTo')!;

  const charWidth = inject<Ref<number>>('charWidth')!;
  const charHeight = inject<Ref<number>>('charHeight')!;
  const onHold = ref<{ line: number; char: number } | null>(null);
  const lastEvent = ref<MouseEvent | null>(null);

  function getCharPos(event: MouseEvent) {
    const editor = Editor.value!;

    const ERect = editor.getBoundingClientRect();

    const clickY = event.clientY - ERect.top + editor.scrollTop;
    const clickX = event.clientX - ERect.left + editor.scrollLeft;
    const _inePos = Math.floor((clickY - charHeight.value) / charHeight.value);
    const linePos = clamp(_inePos, 0, lines.value.length - 1);

    const curr = lines.value[linePos];

    if (curr) {
      const x = clickX;
      const arr = curr.text.split('');

      let pos = 0;
      let offset = -(charWidth.value / 2);

      for (let i = 0; i < arr.length; i++) {
        if (isKeyboardKey(arr[i])) offset += charWidth.value;
        else offset += textDimensions(arr[i]).width;

        if (offset > x) {
          pos = i;
          break;
        }

        if (i == arr.length - 1) {
          pos = i + 1;
        }
      }
      return { line: linePos, char: pos };
    }

    return { line: 0, char: 0 };
  }

  function handleMouseDown(event: MouseEvent) {
    selectRanges.value = null;
    const pos = getCharPos(event);

    onHold.value = pos;
    ignoreScroll.value = true;
    line.value = pos.line;
    char.value = pos.char;

    interval(() => slowScroll(lastEvent.value!), 30, 'scroller');
  }

  function handleMouseMove(event: MouseEvent) {
    if (onHold.value) {
      const pos = getCharPos(event);
      lastEvent.value = event;

      const SAME_LINE = onHold.value.line == pos.line;
      const SAME_CHAR = onHold.value.char == pos.char;

      const POS_CHAR_IS_BIGGER = pos.char > onHold.value.char;
      const POS_LINE_IS_BIGGER = pos.line > onHold.value.line;
      const POS_CHAR_IS_SMALLER = pos.char < onHold.value.char;
      const POS_LINE_IS_SMALLER = pos.line < onHold.value.line;

      line.value = pos.line;
      char.value = pos.char;

      if (SAME_LINE && SAME_CHAR) {
        selectRanges.value = null;
        return;
      }

      if (POS_LINE_IS_SMALLER || (SAME_LINE && POS_CHAR_IS_SMALLER)) {
        selectRanges.value = {
          type: 'backward',
          start: pos,
          endAt: onHold.value,
        };
      } else {
        selectRanges.value = {
          type: 'forward',
          endAt: pos,
          start: onHold.value,
        };
      }
    }
  }

  function slowScroll(event: MouseEvent | null) {
    if (!event) return;
    handleMouseMove(event);
    const editor = Editor.value!;
    const ERect = editor.getBoundingClientRect();

    const clickX = event.clientX - ERect.left;
    const clickY = event.clientY - ERect.top;

    if (clickY < charHeight.value * 0) {
      scrollTo({ y: editor.scrollTop - 12 });
      return;
    }

    if (clickY < charHeight.value * 3) {
      scrollTo({ y: editor.scrollTop - 6 });
      return;
    }

    if (clickY > ERect.height - charHeight.value * 2) {
      scrollTo({ y: editor.scrollTop + 16 });
      return;
    }

    if (clickY > ERect.height - charHeight.value * 4) {
      scrollTo({ y: editor.scrollTop + 8 });
      return;
    }
  }

  function handleMouseUp() {
    onHold.value = null;
    lastEvent.value = null;
    ignoreScroll.value = false;
    TextArea.value?.focus({ preventScroll: true });

    removeInterval('scroller');
  }

  const width = computed(() => {
    const width = Editor.value?.scrollWidth || 0;
    const longestText = lines.value.reduce((a, b) => {
      return a.text.length > b.text.length ? a : b;
    });
    const length = textDimensions(longestText.text).width;

    return length > width ? length : width;
  });

  onMounted(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  });

  onUnmounted(() => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  });
</script>

<template>
  <div>
    <div
      ref="contentRef"
      class="content highlight"
      @mousedown="handleMouseDown"
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
