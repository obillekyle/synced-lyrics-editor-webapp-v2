<script setup lang="ts">
  import {
    computed,
    inject,
    onBeforeUnmount,
    onMounted,
    ref,
    type Ref,
  } from 'vue';
  import { type LineItem, type TextDimensionsFn } from '../helper';
  import { addPX, insertAt, replaceRange } from '@/api/util';

  const lines = inject<Ref<LineItem[]>>('lines')!;
  const textDimensions = inject<TextDimensionsFn>('textDimensions')!;
  const char = inject<Ref<number>>('char')!;
  const line = inject<Ref<number>>('line')!;
  const TextArea = inject<Ref<HTMLTextAreaElement | null>>('TextArea')!;

  const composition_pos = ref<number | null>(null);
  const lastCompositionLength = ref(0);

  const charPos = computed(() => {
    return lines.value[line.value].text.slice(0, char.value).length;
  });

  function handleCompositionStart(event: CompositionEvent) {
    console.clear();
    composition_pos.value = charPos.value;
    char.value = charPos.value + event.data.length;
    lines.value[line.value].text = insertAt(
      lines.value[line.value].text,
      composition_pos.value || 0,
      event.data || ''
    );
  }

  function handleCompositionUpdate(event: CompositionEvent) {
    if (!composition_pos.value) return;

    char.value = composition_pos.value + event.data.length;

    lines.value[line.value].text = replaceRange(
      lines.value[line.value].text,
      [
        composition_pos.value,
        composition_pos.value + lastCompositionLength.value,
      ],
      event.data
    );
    lastCompositionLength.value = event.data.length;
  }

  function handleCompositionEnd(event: CompositionEvent) {
    if (!composition_pos.value) return;

    lines.value[line.value].text = replaceRange(
      lines.value[line.value].text,
      [
        composition_pos.value,
        composition_pos.value + lastCompositionLength.value,
      ],
      event.data || ''
    );
    TextArea.value!.value = '';
    composition_pos.value = null;
    lastCompositionLength.value = 0;
  }

  onMounted(() => {
    const elem = TextArea.value as HTMLTextAreaElement;

    elem.addEventListener('compositionstart', handleCompositionStart);
    elem.addEventListener('compositionupdate', handleCompositionUpdate);
    elem.addEventListener('compositionend', handleCompositionEnd);
  });

  onBeforeUnmount(() => {
    const elem = TextArea.value as HTMLTextAreaElement;

    elem.removeEventListener('compositionstart', handleCompositionStart);
    elem.removeEventListener('compositionupdate', handleCompositionUpdate);
    elem.removeEventListener('compositionend', handleCompositionEnd);
  });
</script>

<template></template>
