<script setup lang="ts">
  import { computed, inject, type Ref } from 'vue';

  import { Icon } from '@iconify/vue/dist/iconify.js';

  import type { EditorSelection, LineItem } from './helper';

  const line = inject<Ref<number>>('line')!;
  const char = inject<Ref<number>>('char')!;
  const lines = inject<Ref<LineItem[]>>('lines')!;
  const fontSize = inject<Ref<number>>('fontSize')!;
  const selectRanges = inject<Ref<EditorSelection | null>>('selection')!;

  const caretPos = computed(() => {
    const curr = lines.value[line.value];

    return Math.min(char.value, curr.text.length);
  });

  const selected = computed(() => {
    if (!selectRanges.value) return undefined;

    const { start, endAt } = selectRanges.value;

    let charCount = 0;

    for (let i = start.line; i <= endAt.line; i++) {
      const curr = lines.value[i];
      if (!curr) continue;

      if (i == start.line && i == endAt.line) {
        charCount += curr.text.slice(start.char, endAt.char).length;
        break;
      }

      if (i == start.line) {
        charCount += curr.text.slice(start.char).length + 1;
        continue;
      }

      if (i == endAt.line) {
        charCount += curr.text.slice(0, endAt.char).length || 1;
        break;
      }

      charCount += curr.text.length || 1;
    }

    return charCount;
  });
</script>

<template>
  <div class="status-bar">
    <span class="zoom-value" v-if="fontSize != 16">
      Zoom: {{ ((fontSize / 16) * 100).toFixed(0) }}%
    </span>
    <span class="caret-pos">
      <span class="pos">Ln {{ line }}, Col {{ caretPos }}</span>

      <span class="selected" v-if="selected">
        {{ ' ' }}({{ selected }} selected)
      </span>
      <template v-else />
    </span>
    <span class="tab-width">Spaces: {{ 4 }}</span>
    <span class="encoding">UTF-8</span>
    <span class="language">lrc</span>
  </div>
</template>
