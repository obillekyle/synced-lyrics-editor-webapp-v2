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
    background: var(--surface-container);

    .mobile-editor {
      position: absolute;
      resize: none;
      padding: var(--md);
      background-color: var(--primary-5);
      font: inherit;
      font-family:
        JetBrains Mono,
        monospace;
      inset: var(--header-size) 0 var(--header-size) 0;
      border: none;
    }
  }
</style>
