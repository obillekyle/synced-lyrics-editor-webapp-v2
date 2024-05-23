<script setup lang="ts">
  import { onMounted, onUnmounted, ref } from 'vue';
  import ContentEditable from '../elements/code-editor/main.vue';
  import { lrcTextFormatter } from '@/app/formatter';
  import { isMobile } from '@/api/util';
  const Lyrics = window.app.lyric;
  const Options = window.app.options;

  const mobile = isMobile();
  const value = ref(Lyrics.stringify());
  const codeEditor = Options.get('experimentalCodeEditor', false);

  const setValue = () => {
    value.value = Lyrics.stringify();
  };

  onMounted(() => {
    Lyrics.addEventListener('parsed', setValue);
  });

  onUnmounted(() => {
    Lyrics.removeEventListener('parsed', setValue);
    Lyrics.parse(value.value);
  });
</script>

<template>
  <div class="edit-screen">
    <template v-if="codeEditor">
      <textarea
        aria-label="Edit Lyrics"
        class="mobile-editor"
        v-if="mobile"
        v-model="value"
      />
      <ContentEditable v-else v-model="value" :formatter="lrcTextFormatter" />
    </template>
    <template v-else>
      <textarea
        aria-label="Edit Lyrics"
        class="mobile-editor"
        v-model="value"
      />
    </template>
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

    .mobile-editor {
      position: absolute;
      resize: none;
      padding: var(--md);
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
