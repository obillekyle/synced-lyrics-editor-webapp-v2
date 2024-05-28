<script setup lang="ts">
  import { computed, inject, ref, type Ref } from 'vue';
  import type { EditorSelection, LineItem, TextDimensionsFn } from '../helper';
  import { inRange } from '@/api/util';
  import { addAPIProvider } from '@iconify/vue/dist/iconify.js';

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

  const lastSelectedValue = ref<(typeof props)['selected']>(false);
  const lastCalculatedValue = ref<string>('');

  const classes = computed(() => {
    if (!selection.value) return;

    if (lastSelectedValue.value == props.selected)
      return lastCalculatedValue.value;

    const index = props.index;
    const start = selection.value.start;
    const endAt = selection.value.endAt;
    const ranges = props.selected;
    if (!ranges) return;

    const prev = lines.value[index - 1];
    const next = lines.value[index + 1];

    const CURRENT_ENDAT = index == endAt.line;
    const CURRENT_START = index == start.line;
    const NEXTLINE_ENDAT = index + 1 == endAt.line;
    const PREVLINE_START = index - 1 == start.line;
    const NEXT_IS_SELECTED =
      !NEXTLINE_ENDAT && inRange(index + 1, start.line, endAt.line);
    const PREV_IS_SELECTED =
      !PREVLINE_START && inRange(index - 1, start.line, endAt.line);

    let classes = '';

    if (ranges === true) {
      if (NEXTLINE_ENDAT && props.text.length < endAt.char) {
        classes += ' endAt-bottom';
      }
      if (PREVLINE_START && props.text.length >= start.char) {
        if (prev.text.length > props.text.length) {
          classes += ' endAt-top';
        }

        if (prev.text.length == props.text.length) {
          classes += ' same-width-prev';
        }
      }

      if (PREV_IS_SELECTED && prev.text.length > props.text.length) {
        classes += ' endAt-top';
      }
      if (NEXT_IS_SELECTED && next.text.length > props.text.length) {
        classes += ' endAt-bottom';
      }
      if (NEXT_IS_SELECTED && next.text.length == props.text.length) {
        classes += ' same-width-next';
      }
      if (PREV_IS_SELECTED && prev.text.length == props.text.length) {
        classes += ' same-width-prev';
      }

      lastCalculatedValue.value = classes + ' start-zero';
      return lastCalculatedValue.value;
    }

    if (CURRENT_START && CURRENT_ENDAT) {
      lastCalculatedValue.value = classes;
      return lastCalculatedValue.value;
    }
    if (
      ranges.start <= 0 &&
      ranges.endAt <= 0 &&
      !(NEXT_IS_SELECTED || PREV_IS_SELECTED)
    ) {
      lastCalculatedValue.value = classes + ' start-zero';
      return lastCalculatedValue.value;
    }

    if (CURRENT_ENDAT) {
      if (
        PREVLINE_START &&
        ranges.endAt >= start.char &&
        prev.text.length >= ranges.endAt
      ) {
        classes += ' endAt-top';
      }

      if (PREV_IS_SELECTED && prev.text.length >= ranges.endAt) {
        classes += ' endAt-top';
      }
    }

    if (CURRENT_START) {
      if (NEXTLINE_ENDAT && ranges.start <= endAt.char) {
        classes += ' start-bottom';
      }
      if (NEXTLINE_ENDAT && props.text.length < endAt.char) {
        classes += ' endAt-bottom';
      }
      if (NEXT_IS_SELECTED && next.text.length >= ranges.start) {
        classes += ' start-bottom';
      }
      if (NEXT_IS_SELECTED && next.text.length > props.text.length) {
        classes += ' endAt-bottom';
      }
      if (NEXT_IS_SELECTED && next.text.length == props.text.length) {
        classes += ' same-width-next';
      }
    }

    if (ranges.start <= 0) classes += ' start-zero';
    lastCalculatedValue.value = classes;
    return lastCalculatedValue.value;
  });

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
  <div
    class="select"
    :class="classes"
    :style="`top: ${(index + 1) * charHeight}px`"
    v-if="visible"
  >
    <span>
      <template v-if="typeof selected == 'boolean' && selected">
        <span class="selected">
          <span class="start" />
          <span class="text has-next">
            {{ text }}
          </span>
          <span class="endAt" />
        </span>
      </template>

      <template v-else-if="typeof selected == 'object'">
        <span class="unselected">{{ text.slice(0, selected.start) }}</span>
        <span class="selected">
          <span class="start" />
          <span
            class="text"
            :class="{ 'has-next': selection.endAt.line != index }"
          >
            {{ text.slice(selected.start, selected.endAt) }}
          </span>
          <span class="endAt" />
        </span>
        <span class="unselected">{{ text.slice(selected.endAt) }}</span>
      </template>

      <template v-else />
    </span>
  </div>
  <template v-else />
</template>

<style lang="scss" scoped>
  .select .selected {
    position: relative;
    .text.has-next {
      &::after {
        content: '';
        width: calc(var(--char-width) / 1.5);
        display: inline-block;
        height: 100%;
      }
    }

    .start,
    .endAt {
      position: absolute;
      display: inline-block;
      background: inherit;
      opacity: 0;
      &::before {
        content: 'A';
        display: inline-block;
        background-color: var(--background-body);
      }
    }
    .start {
      left: calc(var(--char-width) * -1);
    }

    .endAt {
      right: calc(var(--char-width) * -1);
    }
  }

  .select.start-top,
  .select.start-bottom {
    .selected .start {
      opacity: 1;
    }
  }
  .select.endAt-top,
  .select.endAt-bottom {
    .selected {
      .endAt {
        opacity: 1;
      }
    }
  }

  .select.start-top .selected .start::before {
    border-top-right-radius: 3px;
  }

  .select.endAt-top .selected .endAt::before {
    border-top-left-radius: 3px;
  }

  .select.start-bottom .selected .start::before {
    border-bottom-right-radius: 3px;
  }

  .select.endAt-bottom .selected .endAt::before {
    border-bottom-left-radius: 3px;
  }

  .select {
    &:not(.start-top) .selected {
      border-top-left-radius: 3px;
    }

    &:not(.start-bottom) .selected {
      border-bottom-left-radius: 3px;
    }

    &:not(.endAt-top) .selected {
      border-top-right-radius: 3px;
    }

    &:not(.endAt-bottom) .selected {
      border-bottom-right-radius: 3px;
    }

    &.start-zero .selected {
      border-top-left-radius: 0px !important;
      border-bottom-left-radius: 0px !important;
    }

    &.same-width-next .selected {
      border-bottom-right-radius: 0 !important;
    }
    &.same-width-prev .selected {
      border-top-right-radius: 0 !important;
    }
  }
</style>
