<script setup lang="ts">
import { computed, inject, type Ref } from 'vue';
import type { EditorSelection, LineItem, TextDimensionsFn } from '../helper';
import { inRange, addPX, is } from '@/api/util';

const lines = inject<Ref<LineItem[]>>('lines')!;
const selection = inject<Ref<EditorSelection>>('selection')!;
const textDimensions = inject<TextDimensionsFn>('textDimensions')!;
const charWidth = inject<Ref<number>>('charWidth')!;
const charHeight = inject<Ref<number>>('charHeight')!;

const props = defineProps<{
  text: string;
  index: number;
  visible?: boolean;
  selected?: boolean | { start: number; endAt: number };
}>();

const classes = computed(async () => {
  if (!selection.value) return;
  const index = props.index;
  const start = selection.value.start;
  const endAt = selection.value.endAt;
  const selected = inRange(index, start.line, endAt.line);
  if (!selected) return;

  const prev = lines.value[index - 1];
  const next = lines.value[index + 1];

  const HAS_PREV_LINE = prev != undefined;
  const HAS_NEXT_LINE = next != undefined;

  let classes = '';

  if (selected === true) {
    if (
      HAS_PREV_LINE &&
      start.line - 1 == index &&
      start.char < props.text.length
    ) {
      classes += ' end-top';
    }
    if (
      HAS_NEXT_LINE &&
      endAt.line + 1 == index &&
      endAt.char > props.text.length
    ) {
      classes += ' end-bottom';
    }
    return classes;
  }

  if (start.line == index && endAt.line == index) {
    return classes;
  }

  if (start.line == index && start.char > 0) {
    if (index + 1 == endAt.line) {
      if (start.char > endAt.char) {
        classes += ' end-bottom';
      }
      if (start.char < endAt.char) {
        classes += ' start-bottom';
      }
      return classes;
    }

    if (HAS_NEXT_LINE) {
      if (next.text.length > start.char) {
        classes += ' start-bottom';
      }
      if (next.text.length > props.text.length) {
        classes += ' end-bottom';
      }
    }

    return classes;
  }

  if (endAt.line == index && index - 1 == start.line && endAt.char > 0) {
    if (endAt.char > start.char) {
      classes += ' end-top';
    }
    if (endAt.char < start.char) {
      classes += ' start-top';
    }
    return classes;
  }

  if (start.line == index && HAS_NEXT_LINE) {
    if (start.char > 0 && next.text.length > start.char) {
      classes += ' start-bottom';
    }
    if (props.text.length < next.text.length) {
      classes += ' end-bottom';
    }
  }

  if (endAt.line == index && HAS_PREV_LINE) {
    if (endAt.char > 0 && prev.text.length > endAt.char) {
      classes += ' start-top';
    }
    if (props.text.length < prev.text.length) {
      classes += ' end-top';
    }
  }

  return classes;
});

// const styles = computed(() => {
//   const select = selection.value;
//   const selected = props.selected;
//   let styles = `top: ${props.index * charHeight.value}px;`;

//   if (!selected || !selection) return styles;

//   const next = lines.value[props.index + 1];
//   const prev = lines.value[props.index - 1];
//   const index = props.index;

//   const HAS_PREV_LINE = prev != undefined;
//   const HAS_NEXT_LINE = next != undefined;
//   let addWidth = charWidth.value;

//   if (HAS_NEXT_LINE) {
//     if (
//       index + 1 == select.endAt.line &&
//       select.endAt.char > props.text.length
//     ) {
//       addWidth = charWidth.value * 2;
//     }
//     if (props.text.length < next.text.length) {
//       addWidth = charWidth.value * 2;
//     }
//   } else if (HAS_PREV_LINE) {
//     if (index - 1 == select.start.line && select.start.char < 0) {
//       addWidth = charWidth.value * 2;
//     }
//     if (props.text.length < prev.text.length) {
//       addWidth = charWidth.value * 2;
//     }
//   }

//   if (typeof selected == 'boolean') {
//     const width = addPX(textDimensions(props.text).width + addWidth);
//     styles += `left: 0;`;
//     styles += `width: ${width};`;

//     return styles;
//   }

//   if (select.start.line == index && select.endAt.line == index) {
//     addWidth = 0;
//   }

//   const left = addPX(
//     textDimensions(props.text.slice(0, Math.max(0, selected.start))).width +
//     addWidth
//   );

//   const width = addPX(
//     textDimensions(
//       props.text.slice(Math.max(0, selected.start), selected.endAt)
//     ).width + addWidth
//   );

//   styles += `left: ${left};`;
//   styles += `width: ${width};`;

//   return styles;
// });
</script>

<template>
  <div class="select" :class="classes" :style="`top: ${(index + 1) * charHeight}px`" v-if="visible">
    <span>
      <template v-if="typeof selected == 'boolean' && selected">
        <span class="selected">{{ text || ' ' }}</span>
      </template>

      <template v-else-if="typeof selected == 'object'">
        <span class="unselected">{{ text.slice(0, selected.start) }}</span>
        <span class="selected">
          {{ text.slice(selected.start, selected.endAt) }}
        </span>
        <span class="unselected">{{ text.slice(selected.endAt) }}</span>
      </template>

      <template v-else />
    </span>
  </div>
  <template v-else />
</template>
