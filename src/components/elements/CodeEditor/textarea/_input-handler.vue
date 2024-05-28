<script setup lang="ts">
  import { inject, onBeforeUnmount, onMounted, ref, type Ref } from 'vue';
  import type AppClipboard from '@/api/clipboard';
  import {
    fixLineBreaks,
    replaceRange,
    reverseString,
    getUnique,
    insertAt,
    clamp,
  } from '@/api/util';
  import {
    type LineItem,
    type EditorSelection,
    type HistoryItem,
    SELECTION_KEYWORD_MATCHER,
    isKeyboardKey,
    getPair,
  } from '../helper';
  import { processKey } from '@/components/keybinds/keys';
  import { editorKeyBinds } from '../helper';

  const Clipboard = inject<AppClipboard>('Clipboard')!;
  const TextArea = inject<Ref<HTMLTextAreaElement | null>>('TextArea')!;

  const lines = inject<Ref<LineItem[]>>('lines')!;
  const selectRanges = inject<Ref<EditorSelection | null>>('selection')!;

  const history = inject<Ref<HistoryItem[]>>('history')!;
  const historyIndex = inject<Ref<number | undefined>>('historyIndex')!;

  const line = inject<Ref<number>>('line')!;
  const char = inject<Ref<number>>('char')!;

  const scrollHeight = inject<Ref<number>>('scrollHeight')!;
  const scrollWidth = inject<Ref<number>>('scrollWidth')!;
  const charHeight = inject<Ref<number>>('charHeight')!;
  const charWidth = inject<Ref<number>>('charWidth')!;

  const blurAndFocus = inject<() => void>('blurAndFocus')!;
  const scrollTo =
    inject<(pos: { x?: number; y?: number }) => void>('scrollTo')!;

  //#region Shortcuts
  async function handleInput(event: KeyboardEvent) {
    const element = event.currentTarget as HTMLTextAreaElement;
    const select = selectRanges.value;

    const curr = lines.value[line.value];
    const next = lines.value[line.value + 1];
    const prev = lines.value[line.value - 1];
    const last = lines.value[lines.value.length - 1];

    const CARET_POS = char.value;
    const CARET_LINE = line.value;

    const cursor = clamp(char.value, 0, curr.text.length || 0);
    const HAS_NEXT_LINE = next != undefined;
    const HAS_PREV_LINE = prev != undefined;

    processKey(editorKeyBinds.selectAllLines, event, () => {
      selectRanges.value = {
        type: 'forward',
        start: { line: 0, char: 0 },
        endAt: { line: lines.value.length - 1, char: last.text.length },
      };

      char.value = last.text.length;
      line.value = lines.value.length - 1;
    });

    // TODO: fix copy/paste
    processKey(editorKeyBinds.paste, event, async () => {
      let toNextLine = 0;
      const clipboard = await Clipboard.get();

      if (clipboard.startsWith('\n')) toNextLine = 1;

      const pasteLines = fixLineBreaks(clipboard).split('\n');

      const insert: typeof lines.value = [];

      if (select) {
        const firstLine = lines.value[select.start.line];
        const lastLine = lines.value[select.endAt.line];

        pasteLines.forEach((l, index) => {
          let text = l;
          let id: number | undefined = undefined;

          if (index == 0) {
            text = replaceRange(
              firstLine.text,
              [select.start.char, select.endAt.char],
              text
            );

            id = firstLine.id;
          }

          if (index == pasteLines.length - 1) {
            text += lastLine.text.slice(select.endAt.char);
            id ??= lastLine.id;
          }

          id ??= getUnique();

          insert.push({
            text,
            id,
          });
        });

        lines.value.splice(
          select.start.line,
          select.endAt.line - select.start.line + 1,
          ...insert
        );
        return;
      }

      pasteLines.forEach((l, index) => {
        let text = l;
        let id: number | undefined = undefined;

        if (index == 0) {
          id ??= curr.id;
          text = curr.text.slice(0, CARET_POS) + text;
        }

        if (index == pasteLines.length - 1) {
          char.value = CARET_POS + text.length;
          text += curr.text.slice(CARET_POS);
        }

        id ??= getUnique();
        insert.push({
          text,
          id,
        });
      });

      lines.value.splice(CARET_LINE + toNextLine, 1, ...insert);
      line.value = pasteLines.length + CARET_LINE - 1;
      return;
    });

    processKey(editorKeyBinds.copy, event, () => {
      if (select) {
        const start = select.start;
        const endAt = select.endAt;

        const selectedLines = lines.value.slice(
          start.line,
          endAt.line - start.line + 1
        );

        const text = selectedLines.reduce((prev, curr, index) => {
          if (index == 0) {
            return curr.text.slice(start.char);
          }
          if (index == selectedLines.length - 1) {
            return prev + curr.text.slice(0, endAt.char);
          }

          return `${prev}\n${curr.text}`;
        }, '');

        Clipboard.set(text);
        return;
      }

      const text = '\n' + curr.text;
      Clipboard.set(text);
    });

    // TODO: implement undo/redo
    // if (eventKey == 'z') {
    //   const index = Math.max(0, historyVal);
    //   const item = history.value[index];

    //   if (item) {
    //     if (item.type == 'add') {
    //       item.items.forEach((i, index) => {
    //         const current = lines.value[i.line];

    //         const oldText = current.text;

    //         const start = i.char;
    //         const endAt = i.char + i.text.length;

    //         current.text = replaceRange(oldText, [start, endAt], '');

    //         if (index == 0) {
    //           char.value = i.char;
    //           line.value = i.line;
    //         }
    //       });
    //     }

    //     if (item.type == 'remove') {
    //       item.items.forEach((i, index, array) => {
    //         const current = lines.value[i.line];
    //         const oldText = current.text;

    //         current.text = insertAt(oldText, i.char, i.text);

    //         if (index == array.length - 1) {
    //           line.value = i.line;
    //           char.value = i.char + i.text.length;
    //         }
    //       });
    //     }
    //   }
    // }

    // if (event.key.toLowerCase() == 'y') {
    //   const index = Math.max(0, historyVal + 1);
    //   const item = history.value[index];

    //   if (item) {
    //     if (item.type == 'add') {
    //       item.items.forEach((i, index, array) => {
    //         const current = lines.value[i.line];
    //         const oldText = current.text;

    //         current.text = insertAt(oldText, i.char, i.text);

    //         if (index == array.length - 1) {
    //           char.value = i.char + i.text.length;
    //           line.value = i.line;
    //         }
    //       });
    //     }

    //     if (item.type == 'remove') {
    //       item.items.forEach((i, index) => {
    //         const current = lines.value[i.line];

    //         const oldText = current.text;
    //         const start = i.char;
    //         const endAt = i.text.length;

    //         current.text = replaceRange(oldText, [start, endAt], '');

    //         if (index == item.items.length - 1) {
    //           char.value = i.char + i.text.length;
    //           line.value = i.line;
    //         }
    //       });
    //     }
    //   }
    //   return;
    // }

    processKey(editorKeyBinds.indent, event, () => {
      event.preventDefault();
      const oldText = curr.text;
      curr.text = insertAt(oldText, cursor, '    ');
      char.value = cursor + 4;
    });

    processKey(editorKeyBinds.newLine, event, () => {
      event.preventDefault();
      const newLine = { id: getUnique(), text: '' };
      const text = curr.text;

      curr.text = text.slice(0, char.value);
      newLine.text = text.slice(char.value);
      lines.value.splice(line.value + 1, 0, newLine);

      char.value = 0;
      line.value++;
    });

    processKey(editorKeyBinds.newPrevLine, event, () => {
      event.preventDefault();

      const newLine = { id: getUnique(), text: '' };
      lines.value.splice(line.value, 0, newLine);
    });

    processKey(editorKeyBinds.newNextLine, event, () => {
      event.preventDefault();

      const newLine = { id: getUnique(), text: '' };
      lines.value.splice(line.value + 1, 0, newLine);
      line.value++;
    });

    processKey(editorKeyBinds.prevLine, event, () => {
      if (select) {
        line.value = Math.max(0, select.start.line - 1);
        char.value = Math.max(0, line.value ? select.start.char : 0);
        selectRanges.value = null;
        return;
      }

      line.value = Math.max(0, line.value - 1);
    });

    processKey(editorKeyBinds.nextLine, event, () => {
      if (select) {
        line.value = Math.min(lines.value.length - 1, select.endAt.line + 1);
        char.value = Math.max(0, line.value ? select.endAt.char : 0);
        selectRanges.value = null;
        return;
      }

      line.value = Math.min(lines.value.length - 1, line.value + 1);
    });

    processKey(editorKeyBinds.prevChar, event, () => {
      if (select) {
        char.value = select.start.char;
        line.value = select.start.line;
        selectRanges.value = null;
        return;
      }
      if (cursor <= 0 && HAS_PREV_LINE) {
        char.value = prev.text.length;
        line.value -= 1;
        return;
      }
      char.value = Math.max(0, cursor - 1);
    });

    processKey(editorKeyBinds.nextChar, event, () => {
      if (select) {
        char.value = select.endAt.char;
        line.value = select.endAt.line;
        selectRanges.value = null;
        return;
      }
      if (cursor >= curr.text.length && HAS_NEXT_LINE) {
        char.value = 0;
        line.value += 1;
        return;
      }
      char.value = Math.min(cursor + 1, curr.text.length);
    });

    processKey(editorKeyBinds.prevWord, event, () => {
      if (select) {
        char.value = select.start.char;
        line.value = select.start.line;
        selectRanges.value = null;
        return;
      }

      const match = reverseString(curr.text.slice(0, cursor)).match(
        SELECTION_KEYWORD_MATCHER
      );

      if (match) {
        char.value = cursor - match[0].length;
      }
    });

    processKey(editorKeyBinds.nextWord, event, () => {
      if (select) {
        char.value = select.endAt.char;
        line.value = select.endAt.line;
        selectRanges.value = null;
        return;
      }

      const match = curr.text.slice(cursor).match(SELECTION_KEYWORD_MATCHER);

      if (match) {
        char.value = cursor + match[0].length;
      }
    });

    processKey(editorKeyBinds.scrollUp, event, () => {
      scrollTo({ y: scrollHeight.value - charHeight.value * 2 });
    });

    processKey(editorKeyBinds.scrollDown, event, () => {
      scrollTo({ y: scrollHeight.value + charHeight.value * 2 });
    });

    processKey(editorKeyBinds.scrollLeft, event, () => {
      scrollTo({ x: scrollWidth.value - charWidth.value * 2 });
    });

    processKey(editorKeyBinds.scrollRight, event, () => {
      scrollTo({ x: scrollWidth.value + charWidth.value * 2 });
    });

    function removeSelected() {
      if (select) {
        const firstSelected = lines.value[select.start.line];
        const lastSelected = lines.value[select.endAt.line];

        lines.value.splice(
          select.start.line,
          select.endAt.line - select.start.line + 1,
          firstSelected
        );

        firstSelected.text =
          firstSelected.text.slice(0, select.start.char) +
          lastSelected.text.slice(select.endAt.char);

        selectRanges.value = null;
        line.value = select.start.line;
        char.value = select.start.char;
        blurAndFocus();
        return true;
      }
    }

    processKey(editorKeyBinds.removeChar, event, () => {
      if (!removeSelected()) {
        if (cursor <= 0) {
          if (!HAS_PREV_LINE) return;

          lines.value.splice(line.value, 1);
          char.value = prev.text.length;

          prev.text += curr.text;
          line.value = Math.max(0, line.value - 1);
          return;
        }

        curr.text = replaceRange(curr.text, [cursor - 1, cursor], '');
        char.value = Math.max(0, cursor - 1);
      }
    });

    processKey(editorKeyBinds.removeWord, event, () => {
      if (!removeSelected()) {
        if (cursor <= 0) {
          if (!HAS_PREV_LINE) return;
          lines.value.splice(line.value, 1);

          line.value -= 1;
          char.value = prev.text.length;
          return;
        }

        const match = reverseString(curr.text.slice(0, cursor)).match(
          SELECTION_KEYWORD_MATCHER
        );

        if (match) {
          const [text] = match;
          const start = cursor - text.length;

          curr.text = replaceRange(curr.text, [start, cursor], '');
          char.value = start;

          return;
        }
        curr.text = replaceRange(curr.text, [cursor - 1, cursor], '');
        char.value = Math.max(0, cursor - 1);
      }
    });

    processKey(editorKeyBinds.removeNextChar, event, () => {
      if (!removeSelected()) {
        if (cursor >= curr.text.length) {
          if (!HAS_NEXT_LINE) return;

          lines.value.splice(line.value + 1, 1);
          curr.text += next.text;

          return;
        }

        curr.text = replaceRange(curr.text, [cursor, cursor + 1], '');
        blurAndFocus();
      }
    });

    processKey(editorKeyBinds.removeNextChar, event, () => {
      if (!removeSelected()) {
        const match = curr.text.slice(cursor).match(SELECTION_KEYWORD_MATCHER);

        if (match) {
          const [text] = match;
          const endAt = cursor + text.length;

          curr.text = replaceRange(curr.text, [cursor, endAt], '');
          char.value = cursor;

          return;
        }

        curr.text = replaceRange(curr.text, [cursor, cursor + 1], '');
        blurAndFocus();
      }
    });
  }
  //#endregion

  function handleTextInput(event: InputEvent) {
    let value = event.data || '';
    const curr = lines.value[line.value];

    if (!curr) return;

    const elem = event.currentTarget as HTMLTextAreaElement;
    const caret = clamp(char.value, 0, curr.text.length || 0);

    if (!event.isComposing) {
      elem.value = '';

      const pairValue = getPair(value) || '';

      curr.text = insertAt(curr.text, caret, value + pairValue);
      char.value = caret + (pairValue ? 1 : value.length);

      blurAndFocus();
    }
  }

  onMounted(() => {
    const elem = TextArea.value!;

    elem.addEventListener('keydown', handleInput);
    elem.addEventListener('input', handleTextInput as any);
  });

  onBeforeUnmount(() => {
    const elem = TextArea.value!;

    elem.removeEventListener('keydown', handleInput);
    elem.removeEventListener('input', handleTextInput as any);
  });
</script>

<template></template>
