<script setup lang="ts">
  import { inject, onMounted, ref, type Ref } from 'vue';

  import { inRange } from '@/api/util';

  import type { EditorSelection, LineItem } from '../helper';
  import LineEntry from './line-entry.vue';

  const height = inject<Ref<number>>('charHeight')!;
  const lines = inject<Ref<LineItem[]>>('lines')!;
  const selection = inject<Ref<EditorSelection | null>>('selection')!;
  const scrollHeight = inject<Ref<number>>('scrollHeight')!;

  const selectionRef = ref<HTMLDivElement | null>(null);
  const Selection = inject<Ref<HTMLDivElement | null>>('Selection')!;
  const isVisible = inject<(index: number) => boolean>('isLineVisible')!;

  onMounted(() => {
    Selection.value = selectionRef.value;
  });

  function isSelected(index: number) {
    const select = selection.value;

    if (!select) return false;

    if (index == select.start.line || index == select.endAt.line) {
      return {
        start: index == select.start.line ? select.start.char : 0,
        endAt:
          index == select.endAt.line
            ? select.endAt.char
            : lines.value[index].text.length,
      };
    }

    return inRange(index, select.start.line, select.endAt.line);
  }

  onMounted(() => {
    Selection.value = selectionRef.value;
  });
</script>

<template>
  <div class="selection" :class="{ visible: selection }" ref="selectionRef">
    <line-entry
      v-for="({ text, id }, index) in lines"
      :key="id"
      :index="index"
      :visible="isVisible(index)"
      :selected="isSelected(index)"
      :text="text"
    />
  </div>
</template>

<style lang="scss">
  .selection {
    top: 0;
    position: absolute;
    pointer-events: none;
    color: transparent;

    > .select {
      display: flex;
      flex-wrap: nowrap;
      position: absolute;
      white-space: pre;

      > span {
        display: flex;
        flex-wrap: nowrap;
        height: 100%;

        span {
          display: inline-block;
          height: 100%;
        }
      }

      span.selected {
        background: var(--primary-70-20);
      }
    }
  }
</style>
