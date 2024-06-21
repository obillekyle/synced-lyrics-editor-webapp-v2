<script setup lang="ts">
  import type { LRCLine } from '@/api/parser';
  const Lyrics = window.app.lyric;

  defineProps<LRCLine>();
</script>

<template>
  <div class="timing-list">
    <span class="time">{{ Lyrics.timeToString(time) }}</span>
    <span>
      {{ typeof data == 'string' ? data : data.join('') }}
    </span>
  </div>
</template>

<style lang="scss">
  .timing-list {
    display: flex;
    align-items: center;
    gap: var(--sm);
    padding-inline: var(--sm);

    .time {
      min-width: 56px;
      color: var(--primary-70);
    }
  }
</style>
