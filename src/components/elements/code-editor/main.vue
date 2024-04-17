<script setup lang="ts">
  import {
    ref,
    type HTMLAttributes,
    onMounted,
    computed,
    watch,
    provide,
    onBeforeUnmount,
    onUnmounted,
  } from 'vue';
  import { getUnique, clamp, addPX, fixLineBreaks } from '@/api/util';
  import debug from '../debug-view.vue';
  import AppClipboard from '@/api/clipboard';
  import {
    defaultFormatter,
    linesToString,
    stringToLines,
    type LineItem,
    type EditorSelection,
    type HistoryItem,
  } from './helper';

  import TextAreaComponent from './textarea/main.vue';
  import SelectionComponent from './selection/main.vue';
  import LinesComponent from './lines/main.vue';
  import InputHandler from './textarea/_input-handler.vue';
  import SelectionHandler from './textarea/_selection-handler.vue';
  import CompositionHandler from './textarea/_composition-handler.vue';
  import HorizontalScrollBar from './scroll/horizontal.vue';
  import VerticalScrollBar from './scroll/vertical.vue';

  interface ContentEditableProps
    extends /* @vue-ignore */ Omit<HTMLAttributes, 'onChange' | 'disabled'> {
    disabled?: boolean;
    onChange?: (v: string) => void;
    formatter?: (v: string) => string;
    placeholder?: string;
    spellcheck?: boolean;
  }

  const Clipboard = window?.app?.clipboard || new AppClipboard();

  const width = ref(0);
  const height = ref(0);
  const id = getUnique();

  const rootDimensions = ref({
    width: 0,
    height: 0,
  });

  const observer = ref<ResizeObserver | null>(null);

  const line = ref(0);
  const char = ref(0);
  const scrollHeight = ref(0);
  const scrollWidth = ref(0);

  const lines = ref<LineItem[]>([{ id: 0, text: '' }]);
  const history = ref<HistoryItem[]>([]);
  const selectRanges = ref<EditorSelection | null>(null);

  const historyIndex = ref<number | null>(null);

  const ignoreScroll = ref(false);
  const Editor = ref<HTMLDivElement | null>(null);
  const Wrapper = ref<HTMLDivElement | null>(null);
  const Content = ref<HTMLDivElement | null>(null);
  const TextArea = ref<HTMLTextAreaElement | null>(null);
  const Selection = ref<HTMLDivElement | null>(null);
  const TextDimensions = ref<HTMLSpanElement | null>(null);

  function textDimensions(text = ''): { width: number; height: number } {
    const elem = TextDimensions.value;

    if (!elem) return { width: 0, height: 0 };

    elem.textContent = text;
    const rect = elem.getBoundingClientRect();

    return {
      width: rect.width,
      height: rect.height,
    };
  }

  function isLineVisible(index: number) {
    const sHeight = scrollHeight.value;
    const wHeight = rootDimensions.value.height;
    const itemTop = height.value * (index + 1);

    if (sHeight < itemTop + height.value && itemTop < sHeight + wHeight) {
      return true;
    }
  }

  const model = defineModel<string>({
    required: true,
  });

  const props = withDefaults(defineProps<ContentEditableProps>(), {
    disabled: false,
    spellcheck: false,
    formatter: defaultFormatter,
  });

  provide('formatter', props.formatter);
  provide('textDimensions', textDimensions);
  provide('rootDimensions', rootDimensions);
  provide('isLineVisible', isLineVisible);
  provide('blurAndFocus', blurAndFocus);
  provide('scrollTo', scrollTo);
  provide('lines', lines);
  provide('history', history);
  provide('ignoreScroll', ignoreScroll);

  provide('char', char);
  provide('line', line);
  provide('selection', selectRanges);
  provide('historyIndex', historyIndex);

  provide('id', id);
  provide('charHeight', height);
  provide('charWidth', width);
  provide('scrollHeight', scrollHeight);
  provide('scrollWidth', scrollWidth);

  provide('Wrapper', Wrapper);
  provide('Content', Content);
  provide('TextArea', TextArea);
  provide('Selection', Selection);
  provide('Clipboard', Clipboard);
  provide('Editor', Editor);

  function blurAndFocus(ignore: boolean = false) {
    const tElem = TextArea.value;
    const wElem = Editor.value;

    if (!tElem || !wElem) return;

    if (!ignore) {
      tElem.blur();
      tElem.focus({ preventScroll: true });
    }

    const wRect = wElem.getBoundingClientRect();
    let scrollTop = wElem.scrollTop;
    let scrollLeft = wElem.scrollLeft;
    let offsetHeight = height.value * 3;
    let offsetWidth = width.value * 3;
    let lineOffset = height.value * line.value;

    if (scrollTop + offsetHeight > lineOffset) {
      scrollTop = lineOffset - offsetHeight;
    }

    if (scrollTop + wRect.height - offsetHeight < lineOffset) {
      scrollTop = lineOffset - wRect.height + offsetHeight;
    }

    if (scrollLeft + offsetWidth > offset.value) {
      scrollLeft = offset.value - offsetWidth;
    }

    if (scrollLeft + wRect.width - offsetWidth * 2 < offset.value) {
      scrollLeft = offset.value + offsetWidth * 2 - wRect.width;
    }

    scrollTo({ x: scrollLeft, y: scrollTop });
  }

  function scrollTo(pos: { x?: number; y?: number }) {
    if (!Editor.value) return;

    pos.x ??= scrollWidth.value;
    pos.y ??= scrollHeight.value;

    Editor.value.scrollLeft = clamp(pos.x, 0, Editor.value.scrollWidth);
    Editor.value.scrollTop = clamp(pos.y, 0, Editor.value.scrollHeight);

    scrollWidth.value = Editor.value.scrollLeft;
    scrollHeight.value = Editor.value.scrollTop;
  }

  watch(line, () => {
    if (!ignoreScroll.value) blurAndFocus();
  });

  watch(char, () => {
    if (!ignoreScroll.value) blurAndFocus();
  });

  function handleScrollWheel(event: WheelEvent) {
    const target = event.currentTarget as HTMLElement;
    if (event.altKey) {
      const left = target.scrollLeft + event.deltaY / 2;
      scrollTo({ x: left });
    } else {
      const top = target.scrollTop + event.deltaY / 2;
      scrollTo({ y: top });
    }
  }

  function getDimensions() {
    const wrapper = Wrapper.value;
    if (wrapper) {
      const dimensions = wrapper.getBoundingClientRect();
      rootDimensions.value = {
        width: dimensions.width,
        height: dimensions.height,
      };
    }
  }

  onMounted(() => {
    const editor = Editor.value!;
    const wrapper = Wrapper.value!;
    const dimensions = textDimensions('A');

    width.value = dimensions.width;
    height.value = dimensions.height;

    lines.value = stringToLines(fixLineBreaks(model.value));

    editor.addEventListener('wheel', handleScrollWheel);
    observer.value = new ResizeObserver(getDimensions);

    observer.value.observe(wrapper!);
  });

  onBeforeUnmount(() => {
    const editor = Editor.value!;

    model.value = linesToString(lines.value);
    editor.removeEventListener('wheel', handleScrollWheel);
    observer.value?.disconnect();
  });

  watch(model, async (value, prev) => {
    const finalText = linesToString(lines.value);

    if (value != finalText) {
      lines.value = stringToLines(fixLineBreaks(value));
    }
  });

  const offset = computed(() => {
    const item = lines.value[line.value];
    const dimensions = textDimensions(item.text.slice(0, char.value));

    return dimensions.width;
  });
</script>

<template>
  <debug
    :items="{
      char: char,
      line: line,
      width: width,
      height: height,
      offset: offset,
      scrollHeight: scrollHeight,
      selection: selectRanges,
    }"
  />

  <div
    class="content-editable"
    tabindex="0"
    ref="Wrapper"
    :style="{
      '--cursor-pos': Math.min(char, lines[line]?.text?.length || 0),
      '--cursor-line': line,
      '--char-width': addPX(width),
      '--char-height': addPX(height),
      '--char-offset': addPX(offset),
      '--numbers-width': addPX((String(lines).length + 3) * width),
      '--lines-height': addPX(
        (lines.length - 1) * height + rootDimensions.height
      ),
      '--editor-height': addPX(rootDimensions.height),
      '--editor-width': addPX(rootDimensions.width),
      '--number-width': addPX((String(lines.length).length + 4) * width),
      '--scroll-height': addPX(scrollHeight),
    }"
  >
    <div class="line-number">
      <div
        :key="id"
        :class="['number', line == index && 'active']"
        v-for="({ id }, index) in lines"
      >
        {{ index + 1 }}
      </div>
    </div>
    <div class="editor" ref="Editor">
      <SelectionComponent />
      <LinesComponent />
      <TextAreaComponent />

      <CompositionHandler />
      <InputHandler />
      <SelectionHandler />
    </div>
    <HorizontalScrollBar />
    <VerticalScrollBar />
    <span class="char-dimensions" ref="TextDimensions" />
  </div>
</template>

<style lang="scss">
  .content-editable {
    position: absolute;
    inset: 0 0 0 0;
    overflow: hidden;
    user-select: none;

    grid-template-columns: 6ch 1fr;
    padding-bottom: calc(var(--char-height) * 2);
    background: var(--background-body);

    --scrollbar-size: var(--md);

    .editor {
      height: var(--editor-height);
      width: calc(var(--editor-width) - var(--number-width));
      position: absolute;
      left: var(--number-width);
      top: 0;
      scroll-behavior: auto;

      overflow: hidden;
      cursor: text;

      &:hover {
        .scrollbar-horizontal,
        .scrollbar-vertical {
          opacity: 0 !important;
        }
      }
    }

    &:hover {
      .thumb {
        opacity: 1;
      }
    }

    &:focus .content > .line.active::after {
      opacity: 1;
      animation: blink 1s infinite;
    }

    @keyframes blink {
      49% {
        opacity: 1;
      }

      50% {
        opacity: 0;
      }

      99% {
        opacity: 0;
      }

      100% {
        opacity: 1;
      }
    }

    .highlight,
    .content,
    .selection,
    .char-dimensions,
    .line-number {
      line-height: 1.5;
      font-size: var(--font-md);
      font-family: 'JetBrains Mono', Consolas, monospace;
    }

    .char-dimensions {
      position: fixed;
      white-space: pre;
      pointer-events: none;
      opacity: 0;
    }

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
          background: var(--color-700-20);
        }
      }
    }

    &:has(.selection.visible) {
      .line-special {
        box-shadow: none;
      }
    }

    .content {
      margin-top: var(--char-height);
      background: transparent;
      caret-color: white;
      white-space: nowrap;
      min-width: 100%;
      display: flex;
      position: relative;

      flex-direction: column;
      height: var(--lines-height);

      .line-special {
        position: absolute;
        top: calc(var(--cursor-line) * var(--char-height));
        min-height: var(--char-height);
        box-shadow: 0 0 0 1px inset var(--color-700-20);
        pointer-events: none;
        min-width: 100%;
        width: var(--width);
      }

      > .line {
        position: absolute;
        white-space: pre;
        min-height: var(--char-height);
        min-width: 100%;
        width: var(--width);

        &.active {
          outline: 1px solid var(--color-700-20);

          &::after {
            content: '';
            position: absolute;
            width: 1px;
            top: 0;
            // background-color: white;
            left: calc(var(--cursor-pos) * 1ch);
            height: 100%;
          }

          &:empty::before {
            content: '1';
            color: transparent;
          }
        }
      }
    }

    .highlight,
    .content {
      border: none;
      resize: none;
      outline: none;
    }

    textarea {
      position: absolute;
      font: inherit;
      left: var(--char-offset);
      top: calc((var(--cursor-line) + 1) * var(--char-height));
      outline: none;
      border: none;
      pointer-events: none;
      background: none;
      resize: none;
      caret-color: white;
      height: var(--char-height);
    }

    .line-number {
      position: absolute;
      text-align: right;
      top: calc((var(--scroll-height) - var(--char-height)) * -1);
      width: var(--number-width);
      z-index: 2;

      .number {
        opacity: 0.5;
        padding-right: var(--md);

        &.active {
          opacity: 1;
        }
      }
    }
  }
</style>
