<script setup lang="ts">
  import { onBeforeUnmount, onMounted, ref } from 'vue';
  import ContentEditable from '../elements/code-editor/main.vue';
  import { lrcTextFormatter } from '@/app/formatter';
  const Lyrics = window.app.lyric;

  const value = ref(Lyrics.stringify());

  const setValue = () => {
    value.value = Lyrics.stringify();
  };

  onMounted(() => {
    Lyrics.addEventListener('lrc-updated', setValue);
  });

  onBeforeUnmount(() => {
    Lyrics.parse(value.value);
    Lyrics.removeEventListener('lrc-updated', setValue);
  });
</script>

<template>
  <div class="edit-screen">
    <ContentEditable v-model="value" :formatter="lrcTextFormatter" />
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
    background: var(--color-600-10);
  }
</style>
