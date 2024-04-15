<script setup lang="ts">
  import {
    onMounted,
    onUnmounted,
    ref,
    type Ref,
    inject,
    onBeforeUnmount,
  } from 'vue';
  import {
    SELECTION_KEYWORD_MATCHER,
    type EditorSelection,
    type LineItem,
  } from '../helper';
  import { clamp, reverseString } from '@/api/util';

  const TextArea = inject<Ref<HTMLTextAreaElement | null>>('TextArea')!;

  const lines = inject<Ref<LineItem[]>>('lines')!;
  const line = inject<Ref<number>>('line')!;
  const char = inject<Ref<number>>('char')!;
  const selectRanges = inject<Ref<EditorSelection | null>>('selection')!;

  function handleSelection(event: KeyboardEvent) {
    const curr = lines.value[line.value];
    const next = lines.value[line.value + 1];
    const prev = lines.value[line.value - 1];
    const last = lines.value[lines.value.length - 1];

    if (!event.shiftKey) return;

    const select = selectRanges.value;

    let type =
      select?.type ||
      (event.key == 'ArrowLeft' || event.key == 'ArrowUp'
        ? 'backward'
        : 'forward');
    const start = select?.start || {
      line: line.value,
      char: char.value,
    };
    const endAt = select?.endAt || {
      line: line.value,
      char: char.value,
    };

    const CARET_POS = char.value;
    const CARET_LINE = line.value;

    const HAS_NEXT_LINE = next != undefined;
    const HAS_PREV_LINE = prev != undefined;

    const NEXT_IS_LAST_LINE = next && line.value + 1 >= lines.value.length;
    const PREV_IS_FIRST_LINE = prev && line.value - 1 < 0;

    const START_SAME_LINE = start.line == line.value;
    const ENDAT_SAME_LINE = endAt.line == line.value;

    const START_SAME_CHAR = start.char == char.value;
    const ENDAT_SAME_CHAR = endAt.char == char.value;

    const START_CHAR_IS_SMALLER = start.char < char.value;
    const START_CHAR_IS_BIGGER = start.char > char.value;
    const ENDAT_CHAR_IS_SMALLER = endAt.char < char.value;
    const ENDAT_CHAR_IS_BIGGER = endAt.char > char.value;

    const SELECT_BACKWARD = type == 'backward';
    const SELECT_FORWARD = type == 'forward';
    const LEFT_PREV_LINE = HAS_PREV_LINE && CARET_POS <= 0;
    const RIGHT_NEXT_LINE = HAS_NEXT_LINE && CARET_POS >= curr.text.length;

    const LEFT_RETURN_TO_START =
      SELECT_FORWARD && LEFT_PREV_LINE
        ? CARET_LINE - 1 == start.line && start.char == prev.text.length
        : START_SAME_LINE &&
          Math.min(CARET_POS, curr.text.length) - 1 == start.char;

    const RIGHT_RETURN_TO_END =
      SELECT_BACKWARD && RIGHT_NEXT_LINE
        ? CARET_LINE + 1 == endAt.line && endAt.char == 0
        : ENDAT_SAME_LINE && CARET_POS + 1 == endAt.char;

    const DOWN_RETURN_TO_END =
      SELECT_BACKWARD && HAS_NEXT_LINE
        ? CARET_LINE + 1 == endAt.line && ENDAT_SAME_CHAR
        : CARET_LINE == endAt.line && CARET_POS == curr.text.length;

    const UP_RETURN_TO_START =
      SELECT_FORWARD && HAS_PREV_LINE
        ? CARET_LINE - 1 == start.line && START_SAME_CHAR
        : START_SAME_LINE && start.char == 0;

    const DOWN_SWAP_TO_FORWARD =
      SELECT_BACKWARD && ENDAT_SAME_LINE
        ? true
        : CARET_LINE + 1 == endAt.line && ENDAT_CHAR_IS_SMALLER;

    const UP_SWAP_TO_BACKWARD =
      SELECT_FORWARD && START_SAME_LINE
        ? true
        : CARET_LINE - 1 == start.line && START_CHAR_IS_BIGGER;

    if (event.key == 'ArrowLeft') {
      if (SELECT_FORWARD) {
        if (LEFT_RETURN_TO_START) {
          selectRanges.value = null;
          char.value = Math.max(0, start.char);
          return;
        }

        if (CARET_POS === 0 && HAS_PREV_LINE) {
          endAt.line = line.value - 1;
          line.value = line.value - 1;

          const match =
            event.ctrlKey &&
            reverseString(prev.text).match(SELECTION_KEYWORD_MATCHER);

          if (match) {
            const [text] = match;
            const prevLength = prev.text.length;

            if (
              prevLength - text.length <= start.char &&
              line.value - 1 == start.line
            ) {
              selectRanges.value = null;
              char.value = Math.max(0, start.char);
              return;
            }

            endAt.char = prevLength - text.length;
            char.value = prevLength - text.length;
          } else {
            endAt.char = prev.text.length;
            char.value = prev.text.length;
          }

          selectRanges.value = {
            type: 'forward',
            start,
            endAt,
          };

          return;
        }

        const match =
          event.ctrlKey &&
          reverseString(curr.text.slice(0, CARET_POS)).match(
            SELECTION_KEYWORD_MATCHER
          );

        if (match) {
          const [text] = match;

          if (curr.text.length - text.length <= start.char && START_SAME_LINE) {
            selectRanges.value = null;
            char.value = Math.max(0, start.char);
            return;
          }

          endAt.char = Math.max(0, endAt.char - text.length);
          char.value = Math.max(0, char.value - text.length);
        } else {
          endAt.char = Math.max(0, endAt.char - 1);
          char.value = Math.max(0, char.value - 1);
        }

        selectRanges.value = {
          type: 'forward',
          start,
          endAt,
        };
      }

      if (SELECT_BACKWARD) {
        if (CARET_POS === 0 && HAS_PREV_LINE) {
          const match =
            event.ctrlKey &&
            reverseString(prev.text).match(SELECTION_KEYWORD_MATCHER);

          if (match) {
            const [text] = match;

            start.char = Math.max(0, prev.text.length - text.length);
            char.value = Math.max(0, prev.text.length - text.length);
          } else {
            start.char = prev.text.length;
            char.value = prev.text.length;
          }

          start.line = line.value - 1;
          line.value = line.value - 1;

          selectRanges.value = {
            type: 'backward',
            start,
            endAt,
          };

          return;
        }

        const match =
          event.ctrlKey &&
          reverseString(curr.text.slice(0, CARET_POS)).match(
            SELECTION_KEYWORD_MATCHER
          );

        if (match) {
          const [text] = match;

          start.char = Math.max(0, start.char - text.length);
          char.value = Math.max(0, char.value - text.length);
        } else {
          start.char = Math.max(0, start.char - 1);
          char.value = Math.max(0, char.value - 1);
        }

        selectRanges.value = {
          type: 'backward',
          start,
          endAt,
        };
      }
    }

    if (event.key == 'ArrowRight') {
      if (SELECT_FORWARD) {
        if (RIGHT_NEXT_LINE) {
          const match =
            event.ctrlKey && next.text.match(SELECTION_KEYWORD_MATCHER);

          if (match) {
            const [text] = match;

            endAt.char = Math.max(0, text.length);
            char.value = Math.max(0, text.length);
          } else {
            endAt.char = 0;
            char.value = 0;
          }

          endAt.line = line.value + 1;
          line.value = line.value + 1;

          selectRanges.value = {
            type,
            start,
            endAt,
          };
          return;
        }

        const match =
          event.ctrlKey &&
          curr.text.slice(CARET_POS).match(SELECTION_KEYWORD_MATCHER);

        if (match) {
          const [text] = match;

          endAt.char = Math.min(curr.text.length, endAt.char + text.length);
          char.value = Math.min(curr.text.length, char.value + text.length);
        } else {
          endAt.char = Math.min(curr.text.length, endAt.char + 1);
          char.value = Math.min(curr.text.length, char.value + 1);
        }

        selectRanges.value = {
          type,
          start,
          endAt,
        };
        return;
      }

      if (SELECT_BACKWARD) {
        if (RIGHT_RETURN_TO_END) {
          selectRanges.value = null;
          char.value = Math.max(0, endAt.char);
          line.value = Math.max(0, endAt.line);
          return;
        }
        if (RIGHT_NEXT_LINE) {
          const match =
            event.ctrlKey && next.text.match(SELECTION_KEYWORD_MATCHER);

          if (match) {
            const [text] = match;

            if (text.length >= endAt.char && line.value + 1 == endAt.line) {
              selectRanges.value = null;
              char.value = Math.max(0, endAt.char);
              line.value = Math.max(0, endAt.line);
              return;
            }

            start.char = Math.max(0, text.length);
            char.value = Math.max(0, text.length);
          } else {
            start.char = 0;
            char.value = 0;
          }

          start.line = line.value + 1;
          line.value = line.value + 1;

          selectRanges.value = {
            type,
            start,
            endAt,
          };
          return;
        }

        const match =
          event.ctrlKey &&
          curr.text.slice(CARET_POS).match(SELECTION_KEYWORD_MATCHER);

        if (match) {
          const [text] = match;

          if (text.length + char.value >= endAt.char && ENDAT_SAME_LINE) {
            selectRanges.value = null;
            char.value = Math.max(0, endAt.char);
            return;
          }

          start.char = Math.min(curr.text.length, start.char + text.length);
          char.value = Math.min(curr.text.length, char.value + text.length);
        } else {
          start.char = Math.min(curr.text.length, start.char + 1);
          char.value = Math.min(curr.text.length, char.value + 1);
        }

        selectRanges.value = {
          type: 'backward',
          start,
          endAt,
        };
      }
    }

    if (event.key == 'ArrowUp') {
      if (SELECT_FORWARD) {
        if (!HAS_PREV_LINE) {
          endAt.char = start.char;
          endAt.line = line.value;
          start.char = 0;
          start.line = 0;
          char.value = 0;

          selectRanges.value = {
            type: 'backward',
            start,
            endAt,
          };
          return;
        }

        if (UP_RETURN_TO_START) {
          selectRanges.value = null;
          line.value = start.line;
          char.value = start.char;
          return;
        }

        if (UP_SWAP_TO_BACKWARD) {
          endAt.line = start.line;
          endAt.char = start.char;

          start.line = Math.max(0, line.value - 1);
          start.char = clamp(char.value, 0, prev.text.length);

          line.value = start.line;

          selectRanges.value = {
            type: 'backward',
            start,
            endAt,
          };

          return;
        }

        endAt.line = Math.max(0, endAt.line - 1);
        line.value = Math.max(0, line.value - 1);
        endAt.char = clamp(char.value, 0, prev.text.length);

        selectRanges.value = {
          type: 'forward',
          start,
          endAt,
        };
      }

      if (SELECT_BACKWARD) {
        if (!HAS_PREV_LINE) {
          start.line = line.value;
          start.char = 0;
          char.value = 0;

          selectRanges.value = {
            type,
            start,
            endAt,
          };

          return;
        }

        start.line = Math.max(0, start.line - 1);
        line.value = Math.max(0, line.value - 1);
        start.char = clamp(char.value, 0, prev.text.length);

        selectRanges.value = {
          type,
          start,
          endAt,
        };
      }
    }

    if (event.key == 'ArrowDown') {
      if (SELECT_FORWARD) {
        if (!HAS_NEXT_LINE) {
          endAt.char = curr.text.length;
          char.value = curr.text.length;

          selectRanges.value = {
            type: 'forward',
            start,
            endAt,
          };

          return;
        }

        endAt.line = line.value + 1;
        endAt.char = Math.min(char.value, next.text.length);
        line.value = Math.min(line.value + 1, lines.value.length - 1);

        selectRanges.value = {
          type: 'forward',
          start,
          endAt,
        };
      }

      if (SELECT_BACKWARD) {
        if (!HAS_NEXT_LINE) {
          start.char = endAt.char;
          start.line = endAt.line;

          endAt.line = line.value;
          endAt.char = curr.text.length;
          char.value = curr.text.length;

          selectRanges.value = {
            type: 'forward',
            start,
            endAt,
          };

          return;
        }

        if (DOWN_RETURN_TO_END) {
          selectRanges.value = null;
          line.value = endAt.line;
          return;
        }

        if (DOWN_SWAP_TO_FORWARD) {
          start.line = endAt.line;
          start.char = endAt.char;
          endAt.line = line.value + 1;
          endAt.char = Math.min(curr.text.length, char.value);

          line.value = line.value + 1;

          selectRanges.value = {
            type: 'forward',
            start,
            endAt,
          };

          return;
        }

        start.char = Math.min(char.value, next.text.length);
        start.line = Math.min(lines.value.length - 1, line.value + 1);
        line.value = Math.min(lines.value.length - 1, line.value + 1);

        selectRanges.value = {
          type,
          start,
          endAt,
        };
      }
    }
  }

  onMounted(() => {
    const elem = TextArea.value!;

    elem.addEventListener('keydown', handleSelection);
  });

  onBeforeUnmount(() => {
    const elem = TextArea.value!;

    elem.removeEventListener('keydown', handleSelection);
  });
</script>

<template></template>
