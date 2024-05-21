<script setup lang="ts">
  const Player = window.app.player;

  defineProps<{
    lrc?: string;
  }>();

  let lyric = Player.metadata?.common.lyrics?.join('\n') || '';
</script>

<template>
  <template v-if="lrc">
    <p>Do you want to use the provided lyrics?</p>
    <pre>{{ lrc }}</pre>
  </template>

  <template v-else>
    <p>Do you want to use the lyrics embedded into the audio file?</p>
    <pre>{{ lyric }}</pre>
  </template>
</template>
