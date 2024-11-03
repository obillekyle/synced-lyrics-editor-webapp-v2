<script setup lang="ts">
import type { ListItemType } from '@vue-material/core/List/types.js'

defineProps<ListItemType>()
const Lyrics = window.app.lyric
</script>

<template>
  <div class="sort-item">
    <div class="label">{{ Lyrics.lines[value].data }}</div>
  </div>
</template>
  