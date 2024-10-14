<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
const Lyrics = window.app.lyric

const value = ref(Lyrics.stringify())
const setValue = () => {
	value.value = Lyrics.stringify()
}

onMounted(() => {
	Lyrics.addEventListener('parsed', setValue)
})

onUnmounted(() => {
	Lyrics.removeEventListener('parsed', setValue)
	Lyrics.parse(value.value)
})
</script>

<template>
  <div class="edit-screen">
    <textarea
      aria-label="Edit Lyrics"
      placeholder="Paste your lyrics here..."
      class="mobile-editor"
      v-model="value"
    />
  </div>
</template>

<style lang="scss">
  .edit-screen {
    inset: 0 0 0 0;
    position: absolute;
    display: grid;
    overflow: hidden;
    height: inherit;
    grid-template-columns: auto 1fr;
    background: var(--primary-60-10);

    .mobile-editor {
      position: absolute;
      resize: none;
      padding: var(--md);
      background-color: var(--primary-5);
      font: inherit;
      font-family:
        JetBrains Mono,
        monospace;
      inset: 0 0 0 0;
      border: none;
      width: 100%;
      height: 100%;
    }
  }
</style>
