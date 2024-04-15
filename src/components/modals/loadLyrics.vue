<script setup lang="ts">
  const Player = window.app.player;

  let lyric = Player.metadata?.common.lyrics?.join('\n') || '';
</script>

<template>
  <p>Do you want to use the lyrics embedded into the audio file?</p>

  <pre>{{ lyric }}</pre>
</template>
