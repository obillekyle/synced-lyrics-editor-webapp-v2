<script setup lang="ts">
  import {
    computed,
    type HTMLAttributes,
    inject,
    onBeforeUnmount,
    onMounted,
    provide,
    ref,
    type Ref,
    watch,
  } from 'vue';

  import AppClipboard from '@/api/clipboard';
  import { addPX, clamp, fixLineBreaks, getUnique } from '@/api/util';

  import debug from '../debug-view.vue';
  import {
    defaultFormatter,
    type EditorSelection,
    type HistoryItem,
    type LineItem,
    linesToString,
    stringToLines,
  } from './helper';
  import LinesComponent from './lines/main.vue';
  import HorizontalScrollBar from './scroll/horizontal.vue';
  import VerticalScrollBar from './scroll/vertical.vue';
  import SelectionComponent from './selection/main.vue';
  import StatusBar from './status-bar.vue';
  import CompositionHandler from './textarea/_composition-handler.vue';
  import InputHandler from './textarea/_input-handler.vue';
  import SelectionHandler from './textarea/_selection-handler.vue';
  import TextAreaComponent from './textarea/main.vue';

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

  const statusBarSize = ref(22);
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
  const fontSize = ref(16);

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

    elem.style.setProperty('font-size', addPX(fontSize.value));
    const rect = elem.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    return {
      width,
      height,
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

  const props = withDefaults(defineProps<ContentEditableProps>(), {
    disabled: false,
    spellcheck: false,
    formatter: defaultFormatter,
  });

  const model = defineModel<string>({
    required: true,
  });

  // #region Provide
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
  provide('fontSize', fontSize);

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
  // #endregion

  const debugShow = inject<Ref<boolean>>('app-debug')!;

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

  function handleScrollWheel(event: WheelEvent) {
    const target = event.currentTarget as HTMLElement;
    if (event.ctrlKey) {
      event.preventDefault();
      if (event.deltaY > 0) {
        fontSize.value = clamp(fontSize.value - 1, 8, 32);
      } else {
        fontSize.value = clamp(fontSize.value + 1, 8, 32);
      }
    } else if (event.altKey) {
      const left = target.scrollLeft + event.deltaY / 2;
      scrollTo({ x: left });
    } else {
      const top = target.scrollTop + event.deltaY / 2;
      scrollTo({ y: top });
    }
  }

  function getDimensions() {
    const wrapper = Wrapper.value!;

    const dimensions = wrapper.getBoundingClientRect();
    rootDimensions.value = {
      width: dimensions.width,
      height: dimensions.height,
    };
  }

  function getCharDimensions() {
    const dimensions = textDimensions('A');

    width.value = dimensions.width;
    height.value = dimensions.height;
  }

  onMounted(() => {
    const editor = Editor.value!;
    const wrapper = Wrapper.value!;

    getCharDimensions();
    getDimensions();

    editor.addEventListener('wheel', handleScrollWheel);
    observer.value = new ResizeObserver(getDimensions);
    lines.value = stringToLines(fixLineBreaks(model.value));

    observer.value.observe(wrapper!);
  });

  onBeforeUnmount(() => {
    const editor = Editor.value!;

    model.value = linesToString(lines.value);
    editor.removeEventListener('wheel', handleScrollWheel);
    observer.value?.disconnect();
  });

  watch(fontSize, () => getCharDimensions());
  watch(line, () => !ignoreScroll.value && blurAndFocus());
  watch(char, () => !ignoreScroll.value && blurAndFocus(true));

  watch(model, async (value, prev) => {
    const finalText = linesToString(lines.value);

    if (value != finalText) {
      lines.value = stringToLines(fixLineBreaks(value));
    }
  });

  const offset = computed(() => {
    const item = lines.value[line.value];
    const dimensions = textDimensions(item.text.slice(0, char.value));

    return Math.max(0, dimensions.width - 1);
  });
</script>

<template>
  <debug
    :show="debugShow"
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
      '--font-editor': fontSize + 'px',
      '--cursor-pos': Math.min(char, lines[line]?.text?.length || 0),
      '--cursor-line': line,
      '--char-width': addPX(width),
      '--char-height': addPX(height),
      '--char-offset': addPX(offset),
      '--statusbar-size': addPX(statusBarSize),
      '--numbers-width': addPX((String(lines).length + 3) * width),
      '--lines-height': addPX(
        (lines.length - 1) * height + rootDimensions.height - statusBarSize
      ),
      '--editor-height': addPX(rootDimensions.height - statusBarSize),
      '--editor-width': addPX(rootDimensions.width),
      '--number-width': addPX((String(lines.length).length + 4) * width),
      '--scroll-height': addPX(scrollHeight),
    }"
  >
    <div class="line-number">
      <div
        :key="id"
        class="number"
        :class="{ active: line == index }"
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
    <StatusBar />
    <span class="char-dimensions" ref="TextDimensions" />
  </div>
</template>

<style lang="scss">
  .content-editable {
    position: absolute;
    inset: 0 0 0 0;
    overflow: hidden;
    user-select: none;

    padding-bottom: calc(var(--char-height) * 2);
    background: var(--background-body);

    --scrollbar-size: var(--md);

    .editor {
      position: absolute;
      left: var(--number-width);
      top: 0;

      height: var(--editor-height);
      width: calc(var(--editor-width) - var(--number-width));

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

    &:hover .thumb {
      opacity: 1;
    }

    .highlight,
    .content,
    .selection,
    .char-dimensions,
    .line-number {
      line-height: 1.5;
      font-size: var(--font-editor, var(--font-md, 16px));
      font-family: 'JetBrains Mono', Consolas, monospace;
    }

    .status-bar {
      position: absolute;
      inset: auto 0 0 0;
      z-index: 5;

      display: flex;
      align-items: center;
      justify-content: right;
      gap: var(--md);

      font-size: var(--font-xs, 14px);

      padding-inline: var(--sm);
      height: var(--statusbar-size);

      background: inherit;
      border-top: 1px solid #7777;
    }

    .char-dimensions {
      position: fixed;
      white-space: pre;
      pointer-events: none;
      opacity: 0;
    }

    &:has(.selection.visible) {
      .line-special {
        box-shadow: none;
      }
    }

    textarea {
      position: absolute;
      left: var(--char-offset);
      top: calc((var(--cursor-line) + 1) * var(--char-height));

      resize: none;
      pointer-events: none;

      display: block;
      height: var(--char-height);
      width: 2px;
      min-width: 2px;

      outline: none;
      border: none;
      border-left: 2px solid #888;

      background: none;

      font: inherit;
      caret-color: transparent;

      animation: blink 1s infinite;
      &:not(:focus) {
        opacity: 0;
        animation-play-state: paused;
      }
    }

    @keyframes blink {
      49% {
        border-left-color: #888;
      }
      50% {
        border-left-color: transparent;
      }
      99% {
        border-left-color: transparent;
      }
      100% {
        border-left-color: #888;
      }
    }

    .line-number {
      position: absolute;
      top: calc((var(--scroll-height) - var(--char-height)) * -1);
      z-index: 2;

      text-align: right;

      width: var(--number-width);

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
