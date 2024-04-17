<script setup lang="ts">
  import { inject, onBeforeUnmount, onMounted, type Ref } from 'vue';
  import { type LineItem, type TextDimensionsFn } from '../helper';
  import { addPX, insertAt, replaceRange } from '@/api/util';

  const lines = inject<Ref<LineItem[]>>('lines')!;
  const textDimensions = inject<TextDimensionsFn>('textDimensions')!;
  const char = inject<Ref<number>>('char')!;
  const line = inject<Ref<number>>('line')!;
  const TextArea = inject<Ref<HTMLTextAreaElement | null>>('TextArea')!;

  function handleCompositionStart(event: CompositionEvent) {
    const elem = event.currentTarget as HTMLTextAreaElement;
    const curr = lines.value[line.value];

    if (!curr) return;

    elem.value = '';
    elem.style.removeProperty('--char-offset');

    const offset = textDimensions(curr.text.slice(0, char.value));

    elem.style.setProperty('--char-offset', addPX(offset.width));
    curr.text = insertAt(curr.text, char.value, 'ㅤ');
    char.value = char.value + 1;
  }

  function handleCompositionEnd(event: CompositionEvent) {
    const elem = event.currentTarget as HTMLTextAreaElement;
    const curr = lines.value[line.value];

    if (!curr) return;

    const id = char.value - 1;

    elem.value = '';
    elem.style.removeProperty('--char-offset');

    curr.text = replaceRange(curr.text, [id, id + 1], event.data);

    if (!event.data) {
      char.value = id;
    }
  }

  onMounted(() => {
    const elem = TextArea.value as HTMLTextAreaElement;

    elem.addEventListener('compositionstart', handleCompositionStart);
    elem.addEventListener('compositionend', handleCompositionEnd);
  });

  onBeforeUnmount(() => {
    const elem = TextArea.value as HTMLTextAreaElement;

    elem.style.removeProperty('--char-offset');
    elem.removeEventListener('compositionstart', handleCompositionStart);
    elem.removeEventListener('compositionend', handleCompositionEnd);
  });
</script>

<template></template>
