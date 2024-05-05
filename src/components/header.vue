<script setup lang="ts">
  import { onMounted, onUnmounted, ref } from 'vue';

  import Button from './elements/button/button.vue';
  import I18nString from './elements/i18n-string.vue';
  import IconButton from './elements/icon-button.vue';
  import InputNumber from './elements/input/number.vue';
  import InputText from './elements/input/text.vue';
  import presets from './modals/_presets';

  const screenNames = {
    edit: 'APP_EDIT',
    timing: 'APP_TIMING',
    lyric: 'APP_LYRIC',
    debug: 'DEBUG',
  };

  const screen = window.app.screen;
  const current = ref(screen.current);

  function handleChange(value: typeof current.value) {
    current.value = value;
  }

  onMounted(() => {
    screen.addEventListener('screenchange', handleChange);
  });

  onUnmounted(() => {
    screen.removeEventListener('screenchange', handleChange);
  });
</script>

<template>
  <header :data-screen="current" class="app-header">
    <I18nString :entry="screenNames[current]" element="h3" />
    <div class="actions">
      <IconButton
        :onclick="presets.uploadNewLrc"
        class="icon-button"
        title="Open LRC file"
        icon="material-symbols:upload-file-outline-sharp"
      />
      <IconButton
        :onclick="presets.download"
        class="icon-button"
        title="Download"
        icon="material-symbols:download"
      />
    </div>
  </header>
</template>

<style lang="scss">
  .app-header {
    height: var(--app-header-height);
    padding-inline: var(--sm);
    background-color: var(--app-header-color);

    display: flex;
    align-items: center;
    position: relative;

    user-select: none;

    &[data-screen='lyric'] {
      color: white;
      --app-header-color: transparent;
      border-bottom-color: transparent;
    }

    h3 {
      font-weight: 600;
      font-size: var(--font-lg);
      margin-left: var(--sm);
    }

    .actions {
      right: 0;
      position: absolute;
      align-content: center;
      display: flex;
      background-color: inherit;
    }
  }
</style>
