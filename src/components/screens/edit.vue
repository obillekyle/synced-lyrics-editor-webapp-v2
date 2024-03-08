<script setup lang="ts">
  import { onMounted, onUnmounted, ref } from 'vue';
  const Lyrics = window.app.lyric;

  const value = ref(Lyrics.stringify());

  const setValue = () => {
    value.value = Lyrics.stringify();
  };

  onMounted(() => {
    Lyrics.addEventListener('lrc-updated', setValue);
  });

  onUnmounted(() => {
    Lyrics.parse(value.value);
    Lyrics.removeEventListener('lrc-updated', setValue);
  });
</script>

<template>
  <textarea
    placeholder="Paste your lyrics here..."
    class="edit-screen notranslate"
    v-model="value"
  />
</template>

<style lang="scss">
  .edit-screen {
    inset: 0 0 0 0;
    position: absolute;
    white-space: pre-line;
    font-family: 'JetBrains Mono', monospace;
    outline: none;
    height: 100%;
    display: block;
    border: none;
    resize: none;
    padding: var(--xl);
    font-size: var(--font-md);
    background: var(--overlay-10);
    &:empty::after {
      content: 'Click to edit';
      display: block;
    }
  }
</style>
