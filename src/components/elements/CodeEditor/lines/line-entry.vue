<script setup lang="ts">
  import { escapeHtml } from '@/api/util';
  import { ref, inject, type Ref } from 'vue';
  import { defaultFormatter } from '../helper';

  const props = defineProps<{
    text: string;
    index: number;
    selected?: boolean | { start: number; end: number };
    visible?: boolean;
  }>();

  const textRaw = ref(props.text);
  const element = ref<HTMLDivElement | null>();
  const formatted = ref<string | undefined>(undefined);

  const height = inject<Ref<number>>('charHeight')!;
  const formatter = inject<(text: string) => string>(
    'formatter',
    defaultFormatter
  );

  function formatPls(text: string) {
    text = escapeHtml(text);
    if (!props.visible) return formatted.value || text;
    if (text !== textRaw.value || !formatted.value) {
      textRaw.value = text;
      formatted.value = formatter(text);
    }
    return formatted.value;
  }

  defineOptions({
    name: 'LineItem',
    inheritAttrs: false,
  });
</script>

<template>
  <div
    :class="{
      line: true,
      selected,
    }"
    :style="`top: ${index * height}px`"
    :data-index="index"
    ref="element"
    v-if="visible"
    v-bind="$attrs"
    v-html="formatPls(text)"
  />
  <template v-else />
</template>
